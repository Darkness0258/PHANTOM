use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Deserialize)]
pub struct TelemetryPayload {
    pub device_id:    String,
    pub timestamp:    String,
    pub cpu_usage:    f32,
    pub memory_used:  u64,
    pub memory_total: u64,
    pub disk_used:    u64,
    pub disk_total:   u64,
    pub processes:    Vec<ProcessInfo>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ProcessInfo {
    pub pid:    u32,
    pub name:   String,
    pub cpu:    f32,
    pub memory: u64,
}

#[derive(Debug, Deserialize)]
pub struct HeartbeatPayload {
    pub device_id: String,
    pub timestamp: String,
}

use std::sync::{Arc, RwLock};
use std::collections::HashMap;

// Global in-memory telemetry store
lazy_static::lazy_static! {
    static ref TELEMETRY: Arc<RwLock<HashMap<String, TelemetrySnapshot>>> =
        Arc::new(RwLock::new(HashMap::new()));
}

#[derive(Debug, Clone, Serialize)]
pub struct TelemetrySnapshot {
    pub device_id:    String,
    pub timestamp:    String,
    pub cpu_usage:    f32,
    pub memory_used:  u64,
    pub memory_total: u64,
    pub last_seen:    String,
}

pub async fn list_devices() -> Json<Value> {
    let store = TELEMETRY.read().unwrap();
    let devices: Vec<Value> = store.values().map(|t| {
        let ram_pct = if t.memory_total > 0 {
            (t.memory_used as f64 / t.memory_total as f64 * 100.0) as u32
        } else { 0 };
        json!({
            "id":           t.device_id,
            "name":         "Darkness-PC",
            "status":       "online",
            "cpu_usage":    t.cpu_usage,
            "memory_used":  t.memory_used,
            "memory_total": t.memory_total,
            "ram_percent":  ram_pct,
            "last_seen":    t.last_seen,
        })
    }).collect();

    Json(json!({
        "devices": devices,
        "count":   devices.len()
    }))
}

pub async fn receive_telemetry(
    Json(payload): Json<TelemetryPayload>
) -> Json<Value> {
    let snapshot = TelemetrySnapshot {
        device_id:    payload.device_id.clone(),
        timestamp:    payload.timestamp.clone(),
        cpu_usage:    payload.cpu_usage,
        memory_used:  payload.memory_used,
        memory_total: payload.memory_total,
        last_seen:    payload.timestamp,
    };

    let mut store = TELEMETRY.write().unwrap();
    store.insert(payload.device_id, snapshot);

    Json(json!({ "status": "ok" }))
}

pub async fn receive_heartbeat(
    Json(payload): Json<HeartbeatPayload>
) -> Json<Value> {
    tracing::info!("Heartbeat from {}", payload.device_id);
    Json(json!({ "status": "ok", "device_id": payload.device_id }))
}