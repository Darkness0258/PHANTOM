use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PhantomEvent {
    DeviceConnected    { device_id: String },
    DeviceDisconnected { device_id: String },
    DeviceDegraded     { device_id: String },
    DeviceRecovered    { device_id: String },
    ThreatDetected     { device_id: String, description: String },
    HeartbeatMissed    { device_id: String },
    NewDeviceOnNetwork { ip: String, mac: Option<String> },
}

#[derive(Clone)]
pub struct EventBus {
    sender: broadcast::Sender<PhantomEvent>,
}

impl EventBus {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(256);
        Self { sender }
    }

    pub fn publish(&self, event: PhantomEvent) {
        let _ = self.sender.send(event);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<PhantomEvent> {
        self.sender.subscribe()
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}