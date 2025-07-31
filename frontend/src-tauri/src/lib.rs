use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub secure_path: String,
    pub credentials_exist: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub data_dir: String,
}

// Tauri command to get the secure FinWise data directory
#[tauri::command]
async fn get_finwise_data_dir() -> Result<String, String> {
    if let Some(home_dir) = dirs::home_dir() {
        let finwise_dir = home_dir.join("FinWise");
        
        // Create the directory if it doesn't exist
        if !finwise_dir.exists() {
            std::fs::create_dir_all(&finwise_dir)
                .map_err(|e| format!("Failed to create FinWise directory: {}", e))?;
        }
        
        Ok(finwise_dir.to_string_lossy().to_string())
    } else {
        Err("Could not determine home directory".to_string())
    }
}

// Tauri command to check if database credentials exist
#[tauri::command]
async fn check_database_credentials() -> Result<DatabaseConfig, String> {
    let data_dir = get_finwise_data_dir().await?;
    let credentials_path = PathBuf::from(&data_dir).join(".finwise_db_credentials");
    
    Ok(DatabaseConfig {
        secure_path: data_dir,
        credentials_exist: credentials_path.exists(),
    })
}

// Tauri command to get app information
#[tauri::command]
async fn get_app_info() -> Result<AppInfo, String> {
    let data_dir = get_finwise_data_dir().await?;
    
    Ok(AppInfo {
        name: "FinWise".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        data_dir,
    })
}

// Tauri command to open the data directory in the system file manager
#[tauri::command]
async fn open_data_directory(handle: tauri::AppHandle) -> Result<(), String> {
    let data_dir = get_finwise_data_dir().await?;
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    Ok(())
}

// Tauri command to show native notification
#[tauri::command]
async fn show_notification(title: String, message: String) -> Result<(), String> {
    // This would typically use a notification plugin
    log::info!("Notification: {} - {}", title, message);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_finwise_data_dir,
            check_database_credentials,
            get_app_info,
            open_data_directory,
            show_notification
        ])
        .setup(|app| {
            // Set up logging and initial configuration
            if cfg!(debug_assertions) {
                log::info!("FinWise Desktop starting in development mode");
            }
            
            // Restore window state
            let window = app.get_webview_window("main").unwrap();
            let _ = window.set_title("FinWise - Personal Finance Management");
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running FinWise desktop application");
}
