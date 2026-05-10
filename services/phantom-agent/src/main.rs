use anyhow::Result;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

mod collectors;
mod heartbeat;
mod transport;
mod enforcement;

#[tokio::main]
async fn main() -> Result<()> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(tracing::Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    info!("PHANTOM Agent v1.0.0 starting...");

    let core_url = std::env::var("PHANTOM_CORE_URL")
        .unwrap_or_else(|_| "http://localhost:8000".to_string());

    let device_id = uuid::Uuid::new_v4().to_string();
    info!("Agent device ID: {}", device_id);

    // Spawn collectors and heartbeat concurrently
    let hb_url      = core_url.clone();
    let hb_id       = device_id.clone();
    let col_url     = core_url.clone();
    let col_id      = device_id.clone();

    let heartbeat_task = tokio::spawn(async move {
        heartbeat::run(&hb_url, &hb_id).await
    });

    let collector_task = tokio::spawn(async move {
        collectors::run(&col_url, &col_id).await
    });

    let _ = tokio::join!(heartbeat_task, collector_task);
    Ok(())
}