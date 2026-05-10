use anyhow::Result;
use crate::db::connection::DbPool;
use tracing::info;

pub fn run(pool: &DbPool) -> Result<()> {
    let conn = pool.lock().unwrap();

    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS devices (
            id            TEXT PRIMARY KEY,
            name          TEXT NOT NULL,
            hostname      TEXT,
            mac_address   TEXT,
            ip_address    TEXT,
            platform      TEXT NOT NULL DEFAULT 'unknown',
            status        TEXT NOT NULL DEFAULT 'unknown',
            health_score  REAL NOT NULL DEFAULT 100.0,
            agent_version TEXT,
            first_seen    TEXT NOT NULL,
            last_seen     TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS agents (
            id             TEXT PRIMARY KEY,
            device_id      TEXT NOT NULL REFERENCES devices(id),
            version        TEXT NOT NULL,
            last_heartbeat TEXT NOT NULL,
            is_active      INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id         TEXT PRIMARY KEY,
            token      TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id          TEXT PRIMARY KEY,
            device_id   TEXT,
            severity    TEXT NOT NULL DEFAULT 'info',
            message     TEXT NOT NULL,
            resolved    INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL
        );
    ")?;

    info!("Database migrations applied");
    Ok(())
}