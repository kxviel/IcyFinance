use std::io::Write;
use std::path::Path;

use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use tempfile::NamedTempFile;

use crate::storage::MAX_DOCUMENT_BYTES;

fn atomic_write(path: &Path, contents: &[u8]) -> Result<(), String> {
    let directory = path
        .parent()
        .ok_or_else(|| "The destination has no parent folder.".to_string())?;
    let mut pending = NamedTempFile::new_in(directory)
        .map_err(|error| format!("Could not prepare your file: {error}"))?;
    pending
        .write_all(contents)
        .and_then(|_| pending.as_file().sync_all())
        .map_err(|error| format!("Could not write your file: {error}"))?;
    pending
        .persist(path)
        .map_err(|error| format!("Could not finish saving your file: {}", error.error))?;

    #[cfg(unix)]
    std::fs::File::open(directory)
        .and_then(|directory| directory.sync_all())
        .map_err(|error| format!("The file was written but could not be synced: {error}"))?;
    Ok(())
}

#[tauri::command]
pub async fn export_file(app: AppHandle, name: String, contents: String) -> Result<bool, String> {
    if contents.len() > MAX_DOCUMENT_BYTES {
        return Err("This export exceeds the 32 MiB document limit.".into());
    }
    if name.is_empty()
        || name.len() > 180
        || name
            .chars()
            .any(|character| character.is_control() || "/\\:".contains(character))
    {
        return Err("Please use a simple filename for the export.".into());
    }

    tauri::async_runtime::spawn_blocking(move || {
        let extension = if name.to_ascii_lowercase().ends_with(".csv") {
            "csv"
        } else {
            "json"
        };
        let selection = app
            .dialog()
            .file()
            .set_title("Export from IcyFinance")
            .set_file_name(&name)
            .add_filter("IcyFinance export", &[extension])
            .blocking_save_file();
        let Some(selection) = selection else {
            return Ok(false);
        };
        let path = selection
            .into_path()
            .map_err(|error| format!("This destination is not a local file: {error}"))?;
        atomic_write(&path, contents.as_bytes())?;
        Ok(true)
    })
    .await
    .map_err(|error| format!("Could not finish your export: {error}"))?
}
