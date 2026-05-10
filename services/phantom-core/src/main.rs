use anyhow::Result;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

mod config;
mod db;
mod device;
mod events;
mod api;
mod notifications;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    let subscriber = FmtSubscriber::builder()
        .with_max_level(tracing::Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    info!("PHANTOM Core v1.0.0 starting...");

    // Load config
    let cfg = config::Config::load()?;
    info!("Config loaded from: {}", cfg.core.data_dir);

    // Initialize database
    let pool = db::connection::init_pool(&cfg.database.path)?;
    db::migrations::run(&pool)?;
    info!("Database initialized");

    // Start API server
    info!("PHANTOM Core running on port {}", cfg.core.port);
    api::serve(pool, cfg).await?;

    Ok(())
}