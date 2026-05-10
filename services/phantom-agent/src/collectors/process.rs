use sysinfo::System;

pub struct ProcessSnapshot {
    pub pid:    u32,
    pub name:   String,
    pub cpu:    f32,
    pub memory: u64,
}

pub fn get_top(limit: usize) -> Vec<ProcessSnapshot> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut procs: Vec<ProcessSnapshot> = sys.processes()
        .values()
        .map(|p| ProcessSnapshot {
            pid:    p.pid().as_u32(),
            name: p.name().to_string(),
            cpu:    p.cpu_usage(),
            memory: p.memory(),
        })
        .collect();

    procs.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap());
    procs.truncate(limit);
    procs
}