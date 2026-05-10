use sysinfo::System;

pub struct MemoryInfo {
    pub used:  u64,
    pub total: u64,
    pub swap_used:  u64,
    pub swap_total: u64,
}

pub fn get_info() -> MemoryInfo {
    let mut sys = System::new();
    sys.refresh_memory();
    MemoryInfo {
        used:       sys.used_memory(),
        total:      sys.total_memory(),
        swap_used:  sys.used_swap(),
        swap_total: sys.total_swap(),
    }
}