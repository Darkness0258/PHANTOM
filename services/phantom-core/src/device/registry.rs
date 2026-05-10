use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use super::Device;

#[derive(Clone)]
pub struct DeviceRegistry {
    devices: Arc<RwLock<HashMap<String, Device>>>,
}

impl DeviceRegistry {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn insert(&self, device: Device) {
        let mut map = self.devices.write().unwrap();
        map.insert(device.id.clone(), device);
    }

    pub fn get(&self, id: &str) -> Option<Device> {
        let map = self.devices.read().unwrap();
        map.get(id).cloned()
    }

    pub fn all(&self) -> Vec<Device> {
        let map = self.devices.read().unwrap();
        map.values().cloned().collect()
    }

    pub fn remove(&self, id: &str) -> Option<Device> {
        let mut map = self.devices.write().unwrap();
        map.remove(id)
    }

    pub fn count(&self) -> usize {
        self.devices.read().unwrap().len()
    }
}

impl Default for DeviceRegistry {
    fn default() -> Self {
        Self::new()
    }
}