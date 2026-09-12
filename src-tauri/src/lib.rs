mod export;
mod storage;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(storage::BudgetStorage::new(
                app.path().app_local_data_dir()?,
            ));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            storage::load_budget,
            storage::save_budget,
            storage::database_status,
            export::export_file,
        ])
        .run(tauri::generate_context!())
        .expect("IcyFinance could not start");
}
