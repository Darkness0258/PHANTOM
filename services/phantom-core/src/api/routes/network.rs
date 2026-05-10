use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::process::Command;
use std::sync::{OnceLock, RwLock};
use crate::db::connection::DbPool;

static CACHE: OnceLock<RwLock<CachedScan>> = OnceLock::new();
static POOL:  OnceLock<DbPool>             = OnceLock::new();

#[derive(Clone, Default)]
struct CachedScan {
    devices:    Vec<NetworkDevice>,
    scanned_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkDevice {
    pub ip:       String,
    pub hostname: String,
    pub status:   String,
    pub mac:      Option<String>,
    pub vendor:   Option<String>,
}

pub async fn start_auto_scanner(pool: DbPool) {
    POOL.get_or_init(|| pool.clone());

    if let Ok(conn) = pool.lock() {
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS network_scan_cache (
                id         INTEGER PRIMARY KEY,
                scanned_at TEXT NOT NULL,
                device_ip  TEXT NOT NULL,
                hostname   TEXT,
                mac        TEXT,
                vendor     TEXT
            );"
        ).unwrap_or(());
    }

    tokio::spawn(async move {
        loop {
            run_scan_and_cache();
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        }
    });
}

pub fn run_scan_and_cache() {
    let out = Command::new("nmap")
        .args(["-sn", "192.168.1.0/24"])
        .output();

    let devices = match out {
        Ok(o) => parse_nmap_output(&String::from_utf8_lossy(&o.stdout)),
        Err(_) => return,
    };

    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Check for new devices and send push notifications
    let new_devices = crate::notifications::check_new_devices(&devices);
    if !new_devices.is_empty() {
        let body = format!("New device(s) joined: {}", new_devices.join(", "));
        tokio::spawn(async move {
            crate::notifications::send_push_notification(
                "🔔 PHANTOM Alert",
                &body,
            ).await;
        });
    }

    let cache = CACHE.get_or_init(|| RwLock::new(CachedScan::default()));
    if let Ok(mut c) = cache.write() {
        *c = CachedScan { devices: devices.clone(), scanned_at: now.clone() };
    }

    if let Some(pool) = POOL.get() {
        if let Ok(conn) = pool.lock() {
            conn.execute("DELETE FROM network_scan_cache", []).unwrap_or(0);
            for d in &devices {
                conn.execute(
                    "INSERT INTO network_scan_cache (scanned_at, device_ip, hostname, mac, vendor)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    rusqlite::params![now, d.ip, d.hostname, d.mac, d.vendor],
                ).unwrap_or(0);
            }
        }
    }
}

pub async fn scan_network() -> Json<Value> {
    tokio::task::spawn_blocking(run_scan_and_cache).await.unwrap_or(());
    let cache = CACHE.get_or_init(|| RwLock::new(CachedScan::default()));
    let c = cache.read().unwrap();
    Json(json!({
        "status": "ok", "count": c.devices.len(),
        "devices": c.devices, "scanned_at": c.scanned_at, "cached": false
    }))
}

pub async fn scan_network_cached() -> Json<Value> {
    let cache = CACHE.get_or_init(|| RwLock::new(CachedScan::default()));
    {
        let c = cache.read().unwrap();
        if !c.devices.is_empty() {
            return Json(json!({
                "status": "ok", "count": c.devices.len(),
                "devices": c.devices, "scanned_at": c.scanned_at, "cached": true
            }));
        }
    }

    if let Some(pool) = POOL.get() {
        if let Ok(conn) = pool.lock() {
            let mut stmt = conn.prepare(
                "SELECT device_ip, hostname, mac, vendor, scanned_at FROM network_scan_cache"
            ).unwrap();
            let devices: Vec<NetworkDevice> = stmt.query_map([], |row| {
                Ok(NetworkDevice {
                    ip:       row.get(0)?,
                    hostname: row.get::<_, Option<String>>(1)?.unwrap_or_default(),
                    status:   "up".into(),
                    mac:      row.get(2)?,
                    vendor:   row.get(3)?,
                })
            }).unwrap().filter_map(|r| r.ok()).collect();

            let scanned_at: String = conn.query_row(
                "SELECT scanned_at FROM network_scan_cache LIMIT 1",
                [], |row| row.get(0)
            ).unwrap_or_default();

            if let Ok(mut c) = cache.write() {
                *c = CachedScan { devices: devices.clone(), scanned_at: scanned_at.clone() };
            }
            return Json(json!({
                "status": "ok", "count": devices.len(),
                "devices": devices, "scanned_at": scanned_at, "cached": true
            }));
        }
    }

    Json(json!({ "status": "ok", "count": 0, "devices": [], "cached": true }))
}

fn parse_nmap_output(raw: &str) -> Vec<NetworkDevice> {
    let mut devices  = Vec::new();
    let mut ip       = String::new();
    let mut hostname = String::new();
    let mut mac:    Option<String> = None;
    let mut vendor: Option<String> = None;

    for line in raw.lines() {
        let line = line.trim();
        if line.starts_with("Nmap scan report for") {
            if !ip.is_empty() {
                devices.push(NetworkDevice {
                    ip: ip.clone(), hostname: hostname.clone(),
                    status: "up".into(), mac: mac.clone(), vendor: vendor.clone()
                });
            }
            let rest = line.replace("Nmap scan report for", "").trim().to_string();
            if rest.contains('(') {
                let p: Vec<&str> = rest.splitn(2, '(').collect();
                hostname = p[0].trim().to_string();
                ip       = p[1].trim_end_matches(')').to_string();
            } else {
                ip = rest.clone(); hostname = rest;
            }
            mac = None; vendor = None;
        } else if line.starts_with("MAC Address:") {
            let rest = line.replace("MAC Address:", "").trim().to_string();
            if let Some(idx) = rest.find('(') {
                mac    = Some(rest[..idx].trim().to_string());
                vendor = Some(rest[idx+1..].trim_end_matches(')').to_string());
            } else { mac = Some(rest); }
        }
    }
    if !ip.is_empty() {
        devices.push(NetworkDevice { ip, hostname, status: "up".into(), mac, vendor });
    }
    devices
}
// Public function to get cached devices for parental controls
pub fn get_cached_devices() -> Vec<NetworkDevice> {
    let cache = CACHE.get_or_init(|| RwLock::new(CachedScan::default()));
    cache.read().unwrap().devices.clone()
}