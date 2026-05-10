use anyhow::Result;
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub core:     CoreConfig,
    pub database: DatabaseConfig,
    pub network:  NetworkConfig,
    pub security: SecurityConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CoreConfig {
    pub port:     u16,
    pub data_dir: String,
    pub log_level: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseConfig {
    pub path:           String,
    pub encryption_key: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NetworkConfig {
    pub scan_interval_secs: u64,
    pub interface:          String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SecurityConfig {
    pub auto_block_unknown: bool,
    pub alert_on_new_device: bool,
}

impl Default for CoreConfig {
    fn default() -> Self {
        Self {
            port:      8000,
            data_dir:  "./data".to_string(),
            log_level: "info".to_string(),
        }
    }
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            path:           "./data/phantom.db".to_string(),
            encryption_key: None,
        }
    }
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            scan_interval_secs: 30,
            interface:          "eth0".to_string(),
        }
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            auto_block_unknown:  false,
            alert_on_new_device: true,
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            core:     CoreConfig::default(),
            database: DatabaseConfig::default(),
            network:  NetworkConfig::default(),
            security: SecurityConfig::default(),
        }
    }
}

impl Config {
    pub fn load() -> Result<Self> {
        let path = std::env::var("PHANTOM_CONFIG")
            .unwrap_or_else(|_| "./config.toml".to_string());

        if Path::new(&path).exists() {
            let content = std::fs::read_to_string(&path)?;
            let cfg: Config = toml::from_str(&content)?;
            Ok(cfg)
        } else {
            Ok(Config::default())
        }
    }
}