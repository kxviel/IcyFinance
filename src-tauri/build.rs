fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "load_budget",
            "save_budget",
            "database_status",
            "export_file",
        ]),
    ))
    .expect("failed to prepare IcyFinance desktop assets");
}
