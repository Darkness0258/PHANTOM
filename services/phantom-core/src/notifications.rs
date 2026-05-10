use serde_json::json;
use std::sync::{OnceLock, RwLock};
use tracing::info;
use crate::db::connection::DbPool;

static PUSH_POOL: OnceLock<DbPool> = OnceLock::new();

pub fn init(pool: DbPool) {
    PUSH_POOL.get_or_init(|| pool.clone());

    if let Ok(conn) = pool.lock() {
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS push_tokens (
                id    INTEGER PRIMARY KEY,
                token TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS known_devices (
                mac TEXT PRIMARY KEY,
                ip  TEXT NOT NULL,
                first_seen TEXT NOT NULL
            );
        ").unwrap_or(());
    }
}

pub fn register_token(token: &str) {
    if let Some(pool) = PUSH_POOL.get() {
        if let Ok(conn) = pool.lock() {
            conn.execute(
                "INSERT OR IGNORE INTO push_tokens (token) VALUES (?1)",
                rusqlite::params![token],
            ).unwrap_or(0);
            info!("Push token registered: {}...", &token[..20.min(token.len())]);
        }
    }
}

pub fn get_tokens() -> Vec<String> {
    if let Some(pool) = PUSH_POOL.get() {
        if let Ok(conn) = pool.lock() {
            let mut stmt = conn.prepare("SELECT token FROM push_tokens").unwrap();
            return stmt.query_map([], |row| row.get(0))
                .unwrap()
                .filter_map(|r| r.ok())
                .collect();
        }
    }
    vec![]
}

// Returns list of NEW device MACs not seen before
pub fn check_new_devices(devices: &[crate::api::routes::network::NetworkDevice]) -> Vec<String> {
    let mut new_ones = vec![];
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    if let Some(pool) = PUSH_POOL.get() {
        if let Ok(conn) = pool.lock() {
            for d in devices {
                let mac = match &d.mac {
                    Some(m) => m.clone(),
                    None => continue,
                };
                let exists: bool = conn.query_row(
                    "SELECT COUNT(*) FROM known_devices WHERE mac = ?1",
                    rusqlite::params![mac],
                    |row| row.get::<_, i64>(0),
                ).unwrap_or(0) > 0;

                if !exists {
                    conn.execute(
                        "INSERT OR IGNORE INTO known_devices (mac, ip, first_seen) VALUES (?1, ?2, ?3)",
                        rusqlite::params![mac, d.ip, now],
                    ).unwrap_or(0);
                    new_ones.push(format!("{} ({})", d.ip, mac));
                }
            }
        }
    }
    new_ones
}

pub async fn send_push_notification(title: &str, body: &str) {
    let tokens = get_tokens();
    if tokens.is_empty() { return; }

    let messages: Vec<_> = tokens.iter().map(|t| json!({
        "to": t,
        "title": title,
        "body": body,
        "sound": "default",
        "priority": "high",
        "data": { "type": "network_alert" }
    })).collect();

    let client = reqwest::Client::new();
    match client.post("https://exp.host/--/api/v2/push/send")
        .json(&messages)
        .send()
        .await {
        Ok(_)  => info!("Push notification sent: {}", body),
        Err(e) => info!("Push failed: {}", e),
    }
}