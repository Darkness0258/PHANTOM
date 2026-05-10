pub mod heartbeat;
pub mod registry;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id:            String,
    pub name:          String,
    pub hostname:      Option<String>,
    pub mac_address:   Option<String>,
    pub ip_address:    Option<String>,
    pub platform:      Platform,
    pub status:        DeviceStatus,
    pub health_score:  f64,
    pub agent_version: Option<String>,
    pub first_seen:    String,
    pub last_seen:     String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Windows,
    Linux,
    MacOS,
    Android,
    Ios,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DeviceStatus {
    Online,
    Offline,
    Degraded,
    Unknown,
}

impl Default for Device {
    fn default() -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id:            uuid::Uuid::new_v4().to_string(),
            name:          String::new(),
            hostname:      None,
            mac_address:   None,
            ip_address:    None,
            platform:      Platform::Unknown,
            status:        DeviceStatus::Unknown,
            health_score:  100.0,
            agent_version: None,
            first_seen:    now.clone(),
            last_seen:     now,
        }
    }
}