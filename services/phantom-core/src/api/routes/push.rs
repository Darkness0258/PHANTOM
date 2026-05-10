use axum::Json;
use serde::Deserialize;
use serde_json::{json, Value};

#[derive(Deserialize)]
pub struct TokenPayload {
    pub token: String,
}

pub async fn register_push_token(Json(payload): Json<TokenPayload>) -> Json<Value> {
    crate::notifications::register_token(&payload.token);
    Json(json!({ "status": "ok", "message": "Token registered" }))
}