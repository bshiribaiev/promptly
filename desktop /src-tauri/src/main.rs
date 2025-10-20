#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn send_copy() {
  let _ = Command::new("osascript")
    .args([
      "-e",
      r#"tell application "System Events" to keystroke "c" using {command down}"#,
    ])
    .status();
}

#[tauri::command]
fn send_paste() {
  let _ = Command::new("osascript")
    .args([
      "-e",
      r#"tell application "System Events" to keystroke "v" using {command down}"#,
    ])
    .status();
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .invoke_handler(tauri::generate_handler![send_copy, send_paste])
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}