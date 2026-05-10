pub mod cpu;
pub mod memory;
pub mod disk;
pub mod process;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tracing::info;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct TelemetryBatch {
    pub device_id:   String,
    pub timestamp:   String,
    pub cpu_usage:   f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub disk_used:   u64,
    pub disk_total:  u64,
    pub processes:   Vec<ProcessInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid:    u32,
    pub name:   String,
    pub cpu:    f32,
    pub memory: u64,
}

pub async fn run(core_url: &str, device_id: &str) -> Result<()> {
    let client = reqwest::Client::new();
    let url    = format!("{}/api/telemetry", core_url);

    loop {
        let batch = collect(device_id);

        match client.post(&url).json(&batch).send().await {
            Ok(_)  => info!("Telemetry sent for device {}", device_id),
            Err(e) => tracing::warn!("Telemetry failed: {}", e),
        }

        tokio::time::sleep(Duration::from_secs(15)).await;
    }
}

pub fn collect(device_id: &str) -> TelemetryBatch {
    use sysinfo::System;
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let memory_used  = sys.used_memory();
    let memory_total = sys.total_memory();

    let processes: Vec<ProcessInfo> = sys.processes()
        .values()
        .take(20)
        .map(|p| ProcessInfo {
            pid:    p.pid().as_u32(),
            name: p.name().to_string(),
            cpu:    p.cpu_usage(),
            memory: p.memory(),
        })
        .collect();

    TelemetryBatch {
        device_id:    device_id.to_string(),
        timestamp:    chrono::Utc::now().to_rfc3339(),
        cpu_usage,
        memory_used,
        memory_total,
        disk_used:    0,
        disk_total:   0,
        processes,
    }
}