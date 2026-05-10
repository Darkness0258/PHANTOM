use anyhow::Result;
use rusqlite::Connection;
use std::path::Path;
use std::sync::{Arc, Mutex};

pub type DbPool = Arc<Mutex<Connection>>;

pub fn init_pool(db_path: &str) -> Result<DbPool> {
    // Create parent directory if needed
    if let Some(parent) = Path::new(db_path).parent() {
        std::fs::create_dir_all(parent)?;
    }

    let conn = Connection::open(db_path)?;

    // Enable WAL mode for concurrent reads
    conn.execute_batch("
        PRAGMA journal_mode=WAL;
        PRAGMA synchronous=NORMAL;
        PRAGMA foreign_keys=ON;
        PRAGMA cache_size=10000;
    ")?;

    Ok(Arc::new(Mutex::new(conn)))
}