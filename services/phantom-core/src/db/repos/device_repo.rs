use anyhow::Result;
use crate::db::connection::DbPool;
use crate::device::{Device, DeviceStatus, Platform};

pub struct DeviceRepo {
    pool: DbPool,
}

impl DeviceRepo {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub fn upsert(&self, device: &Device) -> Result<()> {
        let conn = self.pool.lock().unwrap();
        conn.execute(
            "INSERT INTO devices
             (id, name, hostname, mac_address, ip_address, platform,
              status, health_score, agent_version, first_seen, last_seen)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)
             ON CONFLICT(id) DO UPDATE SET
               name=excluded.name,
               ip_address=excluded.ip_address,
               status=excluded.status,
               health_score=excluded.health_score,
               last_seen=excluded.last_seen",
            rusqlite::params![
                device.id,
                device.name,
                device.hostname,
                device.mac_address,
                device.ip_address,
                format!("{:?}", device.platform).to_lowercase(),
                format!("{:?}", device.status).to_lowercase(),
                device.health_score,
                device.agent_version,
                device.first_seen,
                device.last_seen,
            ],
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<Device>> {
        let conn = self.pool.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, hostname, mac_address, ip_address,
                    platform, status, health_score, agent_version,
                    first_seen, last_seen FROM devices"
        )?;
        let devices = stmt.query_map([], |row| {
            Ok(Device {
                id:            row.get(0)?,
                name:          row.get(1)?,
                hostname:      row.get(2)?,
                mac_address:   row.get(3)?,
                ip_address:    row.get(4)?,
                platform:      Platform::Unknown,
                status:        DeviceStatus::Unknown,
                health_score:  row.get(7)?,
                agent_version: row.get(8)?,
                first_seen:    row.get(9)?,
                last_seen:     row.get(10)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();
        Ok(devices)
    }
}