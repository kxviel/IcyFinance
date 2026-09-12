use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use rusqlite::{params, Connection, OptionalExtension};
use serde_json::Value;

pub const MAX_DOCUMENT_BYTES: usize = 32 * 1024 * 1024;
const DOCUMENT_ID: &str = "primary";

#[derive(Clone)]
pub struct BudgetStorage {
    path: PathBuf,
    access: Arc<Mutex<()>>,
}

impl BudgetStorage {
    pub fn new(directory: PathBuf) -> Self {
        Self {
            path: directory.join("icyfinance.sqlite3"),
            access: Arc::new(Mutex::new(())),
        }
    }

    // Keep SQLite off the webview thread and serialize reads with writes,
    // including concurrent first-run loads under React Strict Mode.
    async fn run<T: Send + 'static>(
        &self,
        operation: impl FnOnce(&Connection) -> Result<T, String> + Send + 'static,
    ) -> Result<T, String> {
        let storage = self.clone();
        tauri::async_runtime::spawn_blocking(move || {
            let _access = storage.access.lock().map_err(|_| "SQLite storage is unavailable. Restart IcyFinance.")?;
            let directory = storage.path.parent().ok_or("The database folder is missing.")?;
            fs::create_dir_all(directory)
                .map_err(|error| format!("Could not create the database folder: {error}"))?;
            let connection = Connection::open(&storage.path)
                .map_err(|error| format!("Could not open your SQLite database: {error}"))?;
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                fs::set_permissions(&storage.path, fs::Permissions::from_mode(0o600))
                    .map_err(|error| format!("Could not secure your database file: {error}"))?;
            }
            connection.busy_timeout(Duration::from_secs(5))
                .map_err(|error| format!("Could not configure SQLite: {error}"))?;
            connection.execute_batch(
                "PRAGMA synchronous = FULL;
                 CREATE TABLE IF NOT EXISTS icyfinance_documents (
                    id TEXT PRIMARY KEY,
                    document TEXT NOT NULL CHECK (json_valid(document) AND json_type(document) = 'object'),
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                 );",
            ).map_err(|error| format!("Could not prepare SQLite storage: {error}"))?;
            operation(&connection)
        })
        .await
        .map_err(|error| format!("Could not finish the database operation: {error}"))?
    }
}

fn validate_document(contents: &str) -> Result<(), String> {
    if contents.len() > MAX_DOCUMENT_BYTES {
        return Err("This budget exceeds the 32 MiB document limit.".into());
    }
    let value: Value = serde_json::from_str(contents)
        .map_err(|error| format!("The budget is not valid JSON: {error}"))?;
    if !value.is_object() {
        return Err("A budget must be a JSON object.".into());
    }
    Ok(())
}

#[tauri::command]
pub async fn load_budget(
    storage: tauri::State<'_, BudgetStorage>,
) -> Result<Option<String>, String> {
    storage
        .run(|connection| {
            let contents: Option<String> = connection
                .query_row(
                    "SELECT document FROM icyfinance_documents WHERE id = ?1",
                    [DOCUMENT_ID],
                    |row| row.get(0),
                )
                .optional()
                .map_err(|error| format!("Could not load your budget from SQLite: {error}"))?;
            if let Some(document) = &contents {
                validate_document(document)?;
            }
            Ok(contents)
        })
        .await
}

#[tauri::command]
pub async fn save_budget(
    storage: tauri::State<'_, BudgetStorage>,
    contents: String,
) -> Result<(), String> {
    validate_document(&contents)?;
    storage
        .run(move |connection| {
            connection
                .execute(
                    "INSERT INTO icyfinance_documents (id, document, updated_at)
             VALUES (?1, ?2, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE
             SET document = excluded.document, updated_at = excluded.updated_at",
                    params![DOCUMENT_ID, contents],
                )
                .map_err(|error| format!("Could not save your budget to SQLite: {error}"))?;
            Ok(())
        })
        .await
}

#[tauri::command]
pub async fn database_status(storage: tauri::State<'_, BudgetStorage>) -> Result<String, String> {
    let path = storage.path.clone();
    storage
        .run(move |connection| {
            let status: String = connection
                .query_row("PRAGMA quick_check(1)", [], |row| row.get(0))
                .map_err(|error| format!("Could not check SQLite: {error}"))?;
            if status != "ok" {
                return Err(format!(
                    "SQLite needs attention: {status}. Your budget has not been replaced."
                ));
            }
            Ok(format!("Saved on this device: {}", path.display()))
        })
        .await
}
