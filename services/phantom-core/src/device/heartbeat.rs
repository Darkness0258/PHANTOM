use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};
use tracing::{info, warn};

#[derive(Clone)]
pub struct HeartbeatTracker {
    last_seen: Arc<RwLock<HashMap<String, Instant>>>,
    timeout:   Duration,
}

impl HeartbeatTracker {
    pub fn new(timeout_secs: u64) -> Self {
        Self {
            last_seen: Arc::new(RwLock::new(HashMap::new())),
            timeout:   Duration::from_secs(timeout_secs),
        }
    }

    pub fn record(&self, device_id: &str) {
        let mut map = self.last_seen.write().unwrap();
        map.insert(device_id.to_string(), Instant::now());
        info!("Heartbeat received from device: {}", device_id);
    }

    pub fn is_alive(&self, device_id: &str) -> bool {
        let map = self.last_seen.read().unwrap();
        match map.get(device_id) {
            Some(last) => last.elapsed() < self.timeout,
            None => false,
        }
    }

    pub fn get_stale(&self) -> Vec<String> {
        let map = self.last_seen.read().unwrap();
        map.iter()
            .filter(|(_, t)| t.elapsed() >= self.timeout)
            .map(|(id, _)| id.clone())
            .collect()
    }

    pub fn check_all(&self) -> Vec<String> {
        let stale = self.get_stale();
        for id in &stale {
            warn!("Device {} missed heartbeat — marking degraded", id);
        }
        stale
    }
}