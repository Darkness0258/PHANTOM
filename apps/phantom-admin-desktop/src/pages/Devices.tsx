import React, { useEffect, useState } from "react"
import axios from "axios"

interface DeviceData {
  id: string
  name: string
  status: string
  cpu_usage: number
  ram_percent: number
  memory_used: number
  memory_total: number
  last_seen: string
}

export default function Devices() {
  const [devices, setDevices] = useState<DeviceData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/devices")
      setDevices(res.data.devices || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
    const interval = setInterval(fetchDevices, 5000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(1) + " GB"

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div style={{ fontSize:"15px", fontWeight:600 }}>Live Devices</div>
        <div style={{ fontSize:"11px", color:"#4a6278" }}>{devices.length} device{devices.length !== 1 ? "s" : ""} · updates every 5s</div>
      </div>
      {loading && <div style={{ color:"#4a6278" }}>Connecting to phantom-core...</div>}
      {!loading && devices.length === 0 && (
        <div style={{ background:"#0b1019", border:"1px solid #141e2e", borderRadius:"11px", padding:"24px", textAlign:"center" }}>
          <div style={{ fontSize:"24px", marginBottom:"8px" }}>📡</div>
          <div style={{ color:"#4a6278", fontSize:"13px" }}>No devices reporting. Start phantom-agent.</div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
        {devices.map(d => {
          const cpuColor = d.cpu_usage > 80 ? "#f43f5e" : d.cpu_usage > 50 ? "#fbbf24" : "#10d98a"
          const ramColor = d.ram_percent > 80 ? "#f43f5e" : d.ram_percent > 60 ? "#fbbf24" : "#8b5cf6"
          return (
            <div key={d.id} style={{ background:"#0b1019", border:"1px solid #141e2e", borderRadius:"9px", padding:"13px 15px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                <span style={{ fontSize:"20px" }}>💻</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:"13px" }}>{d.name}</div>
                  <div style={{ fontSize:"10px", fontFamily:"monospace", color:"#4a6278" }}>{d.id.slice(0,16)}...</div>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"5px" }}>
                  <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#10d98a" }} />
                  <span style={{ fontSize:"10px", color:"#10d98a" }}>LIVE</span>
                </div>
              </div>
              <div style={{ marginBottom:"7px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10.5px", color:"#4a6278", marginBottom:"3px" }}>
                  <span>CPU</span><span style={{ color:cpuColor }}>{d.cpu_usage.toFixed(1)}%</span>
                </div>
                <div style={{ height:"4px", background:"#141e2e", borderRadius:"2px" }}>
                  <div style={{ height:"100%", width:Math.min(d.cpu_usage,100)+"%", background:cpuColor, borderRadius:"2px", transition:"width .5s" }} />
                </div>
              </div>
              <div style={{ marginBottom:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10.5px", color:"#4a6278", marginBottom:"3px" }}>
                  <span>RAM</span><span style={{ color:ramColor }}>{d.ram_percent}% · {fmt(d.memory_used)} / {fmt(d.memory_total)}</span>
                </div>
                <div style={{ height:"4px", background:"#141e2e", borderRadius:"2px" }}>
                  <div style={{ height:"100%", width:Math.min(d.ram_percent,100)+"%", background:ramColor, borderRadius:"2px", transition:"width .5s" }} />
                </div>
              </div>
              <div style={{ fontSize:"10px", color:"#3a4e63" }}>Last seen: {new Date(d.last_seen).toLocaleTimeString()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
