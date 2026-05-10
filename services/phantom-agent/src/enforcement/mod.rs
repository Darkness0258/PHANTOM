use tracing::info;

pub fn block_app(name: &str) {
    info!("Blocking application: {}", name);
    // Platform-specific implementation added later
}

pub fn lock_screen() {
    info!("Locking screen");
    // Platform-specific implementation added later
}

pub fn apply_network_rule(rule: &str) {
    info!("Applying network rule: {}", rule);
    // Platform-specific implementation added later
}