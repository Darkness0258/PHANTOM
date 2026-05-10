pub mod devices;
pub mod network;
pub mod push;
pub mod parental;

use axum::Json;
use serde_json::{json, Value};

pub async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "phantom-core" }))
}