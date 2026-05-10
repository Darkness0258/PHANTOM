use sysinfo::System;

pub fn get_usage() -> f32 {
    let mut sys = System::new();
    sys.refresh_all();
    sys.global_cpu_info().cpu_usage()
}

pub fn get_core_count() -> usize {
    let sys = System::new_all();
    sys.cpus().len()
}