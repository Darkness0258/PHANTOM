use anyhow::Result;
use serde_json::json;
use tracing::{info, warn};
use std::time::Duration;

pub async fn run(core_url: &str, device_id: &str) -> Result<()> {
    let client = reqwest::Client::new();
    let url    = format!("{}/api/heartbeat", core_url);

    loop {
        let payload = json!({
            "device_id": device_id,
            "timestamp": chrono::Utc::now().to_rfc3339()
        });

        match client.post(&url).json(&payload).send().await {
            Ok(_)  => info!("Heartbeat sent for device {}", device_id),
            Err(e) => warn!("Heartbeat failed: {}", e),
        }

        tokio::time::sleep(Duration::from_secs(30)).await;
    }
}