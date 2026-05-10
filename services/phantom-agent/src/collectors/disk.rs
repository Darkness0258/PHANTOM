use sysinfo::Disks;

pub struct DiskInfo {
    pub name:      String,
    pub used:      u64,
    pub total:     u64,
    pub available: u64,
}

pub fn get_all() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    disks.iter().map(|d| DiskInfo {
        name:      d.name().to_string_lossy().to_string(),
        total:     d.total_space(),
        available: d.available_space(),
        used:      d.total_space() - d.available_space(),
    }).collect()
}