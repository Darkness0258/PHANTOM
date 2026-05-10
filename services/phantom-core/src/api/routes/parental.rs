use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::process::Command;
use std::sync::{OnceLock, RwLock};
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceRule {
    pub name:    String,
    pub ip:      String,
    pub mac:     String,
    pub blocked: bool,
}

// Stores block states + custom names keyed by IP
static BLOCK_STATE: OnceLock<RwLock<std::collections::HashMap<String, (bool, String)>>> = OnceLock::new();

fn get_state() -> &'static RwLock<std::collections::HashMap<String, (bool, String)>> {
    BLOCK_STATE.get_or_init(|| RwLock::new(std::collections::HashMap::new()))
}

// Get all devices from nmap cache + merge with block states
pub async fn list_devices() -> Json<Value> {
    let state = get_state().read().unwrap();

    // Load from nmap cache
    let devices = crate::api::routes::network::get_cached_devices()
        .into_iter()
        .filter(|d| !d.ip.ends_with(".1") && d.ip != "192.168.1.9") // exclude router + own PC
        .map(|d| {
            let (blocked, name) = state.get(&d.ip)
                .cloned()
                .unwrap_or((false, format!("Device {}", d.ip.split('.').last().unwrap_or("?"))));
            DeviceRule {
                name,
                ip:      d.ip.clone(),
                mac:     d.mac.unwrap_or_default(),
                blocked,
            }
        })
        .collect::<Vec<_>>();

    Json(json!({ "status": "ok", "devices": devices }))
}

#[derive(Deserialize)]
pub struct BlockRequest {
    pub ip:    String,
    pub block: bool,
}

#[derive(Deserialize)]
pub struct RenameRequest {
    pub ip:   String,
    pub name: String,
}

pub async fn set_block(Json(req): Json<BlockRequest>) -> Json<Value> {
    let rule_name    = format!("PHANTOM-PARENTAL-{}", req.ip.replace('.', "-"));
    let rule_name_in = format!("PHANTOM-PARENTAL-IN-{}", req.ip.replace('.', "-"));

    if req.block {
        let _ = Command::new("netsh")
            .args(["advfirewall", "firewall", "add", "rule",
                &format!("name={}", rule_name),
                "dir=out", "action=block",
                &format!("localip={}", req.ip),
                "enable=yes"])
            .output();
        let _ = Command::new("netsh")
            .args(["advfirewall", "firewall", "add", "rule",
                &format!("name={}", rule_name_in),
                "dir=in", "action=block",
                &format!("remoteip={}", req.ip),
                "enable=yes"])
            .output();
        info!("Blocked device: {}", req.ip);
        update_state(&req.ip, Some(true), None);
        Json(json!({ "status": "ok", "message": format!("Blocked {}", req.ip), "blocked": true }))
    } else {
        let _ = Command::new("netsh")
            .args(["advfirewall", "firewall", "delete", "rule", &format!("name={}", rule_name)])
            .output();
        let _ = Command::new("netsh")
            .args(["advfirewall", "firewall", "delete", "rule", &format!("name={}", rule_name_in)])
            .output();
        info!("Unblocked device: {}", req.ip);
        update_state(&req.ip, Some(false), None);
        Json(json!({ "status": "ok", "message": format!("Unblocked {}", req.ip), "blocked": false }))
    }
}

pub async fn rename_device(Json(req): Json<RenameRequest>) -> Json<Value> {
    update_state(&req.ip, None, Some(req.name.clone()));
    Json(json!({ "status": "ok", "message": "Renamed" }))
}

pub async fn get_status() -> Json<Value> {
    list_devices().await
}

fn update_state(ip: &str, blocked: Option<bool>, name: Option<String>) {
    if let Ok(mut state) = get_state().write() {
        let entry = state.entry(ip.to_string()).or_insert((false, format!("Device {}", ip.split('.').last().unwrap_or("?"))));
        if let Some(b) = blocked { entry.0 = b; }
        if let Some(n) = name    { entry.1 = n; }
    }
}