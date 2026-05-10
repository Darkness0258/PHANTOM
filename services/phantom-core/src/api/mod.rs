pub mod routes;

use anyhow::Result;
use axum::{Router, routing::{get, post}};
use axum::http::Method;
use tower_http::cors::{CorsLayer, Any};
use crate::config::Config;
use crate::db::connection::DbPool;
use tracing::info;

pub async fn serve(pool: DbPool, cfg: Config) -> Result<()> {
    crate::notifications::init(pool.clone());
    routes::network::start_auto_scanner(pool.clone()).await;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/health",              get(routes::health))
        .route("/devices",             get(routes::devices::list_devices))
        .route("/api/telemetry",       post(routes::devices::receive_telemetry))
        .route("/api/heartbeat",       post(routes::devices::receive_heartbeat))
        .route("/network/scan",        get(routes::network::scan_network))
        .route("/network/scan/cached", get(routes::network::scan_network_cached))
        .route("/push/register",       post(routes::push::register_push_token))
        .route("/parental/devices",    get(routes::parental::list_devices))
        .route("/parental/block",      post(routes::parental::set_block))
        .route("/parental/status",     get(routes::parental::get_status))
        .layer(cors);

    let addr = format!("0.0.0.0:{}", cfg.core.port);
    info!("API listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}