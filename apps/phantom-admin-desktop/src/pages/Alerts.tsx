import React, { useState, useEffect } from "react"
import axios from "axios"

interface Alert {
  id: string
  severity: "critical" | "warning" | "info"
  message: string
  device: string
  time: string
  resolved: boolean
}

const MOCK_ALERTS: Alert[] = [
  { id:"1", severity:"critical", message:"Unknown device attempted to join network", device:"192.168.1.99", time:"2 min ago", resolved:false },
  { id:"2", severity:"warning",  message:"Darkness-PC CPU above 90% for 5 minutes", device:"Darkness-PC", time:"8 min ago", resolved:false },
  { id:"3", severity:"warning",  message:"Ahmed tablet exceeded daily screen limit", device:"Ahmed-Tablet", time:"1 hr ago", resolved:true  },
  { id:"4", severity:"info",     message:"phantom-agent reconnected after restart", device:"Darkness-PC", time:"2 hr ago", resolved:true  },
  { id:"5", severity:"critical", message:"External port scan detected", device:"45.33.32.156", time:"3 hr ago", resolved:true  },
  { id:"6", severity:"info",     message:"WireGuard VPN tunnel established", device:"Darkness-Phone", time:"5 hr ago", resolved:true  },
]

const SEV_COLOR = { critical:"#f43f5e", warning:"#fbbf24", info:"#00e5ff" }
const SEV_BG    = { critical:"rgba(244,63,94,.08)", warning:"rgba(251,191,36,.08)", info:"rgba(0,229,255,.08)" }
const SEV_ICON  = { critical:"🔴", warning:"🟡", info:"🔵" }

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [filter, setFilter] = useState<"all"|"active"|"resolved">("all")

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get("http://localhost:8000/devices")
        const devices = res.data.devices || []
        devices.forEach((d: any) => {
          if (d.cpu_usage > 85) {
            const newAlert: Alert = {
              id: Date.now().toString(),
              severity: "warning",
              message: d.name + " CPU at " + d.cpu_usage.toFixed(0) + "% — high load",
              device: d.name,
              time: "just now",
              resolved: false
            }
            setAlerts(prev => {
              const exists = prev.some(a => a.message === newAlert.message)
              return exists ? prev : [newAlert, ...prev]
            })
          }
        })
      } catch {}
    }
    check()
    const i = setInterval(check, 10000)
    return () => clearInterval(i)
  }, [])

  const resolve = (id: string) =>
    setAlerts(prev => prev.map(a => a.id===id ? {...a, resolved:true} : a))
  const dismiss = (id: string) =>
    setAlerts(prev => prev.filter(a => a.id!==id))

  const filtered = alerts.filter(a =>
    filter==="all" ? true : filter==="active" ? !a.resolved : a.resolved
  )
  const activeCount = alerts.filter(a => !a.resolved).length

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <div style={{ fontSize:"15px", fontWeight:600 }}>Alerts and Events</div>
          <div style={{ fontSize:"11px", color:"#4a6278", marginTop:"2px" }}>{activeCount} active</div>
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          {(["all","active","resolved"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"5px 13px", borderRadius:"6px", cursor:"pointer",
              fontSize:"11.5px", fontWeight:600, border:"1px solid",
              background: filter===f ? "rgba(0,229,255,.12)" : "transparent",
              borderColor: filter===f ? "#00e5ff" : "#1a2840",
              color: filter===f ? "#00e5ff" : "#4a6278",
              textTransform:"capitalize"
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"11px", marginBottom:"16px" }}>
        {[
          { label:"Critical", value: alerts.filter(a=>a.severity==="critical"&&!a.resolved).length, color:"#f43f5e" },
          { label:"Warnings", value: alerts.filter(a=>a.severity==="warning"&&!a.resolved).length,  color:"#fbbf24" },
          { label:"Info",     value: alerts.filter(a=>a.severity==="info"&&!a.resolved).length,     color:"#00e5ff" },
        ].map(s => (
          <div key={s.label} style={{ background:"#0b1019", border:"1px solid #141e2e", borderRadius:"9px", padding:"13px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ fontSize:"26px", fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"12px", color:"#4a6278" }}>Active {s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {filtered.length === 0 && (
          <div style={{ background:"#0b1019", border:"1px solid #141e2e", borderRadius:"11px", padding:"24px", textAlign:"center", color:"#4a6278" }}>
            No alerts in this category
          </div>
        )}
        {filtered.map(alert => (
          <div key={alert.id} style={{
            background: alert.resolved ? "#0b1019" : SEV_BG[alert.severity],
            border: "1px solid " + (alert.resolved ? "#141e2e" : SEV_COLOR[alert.severity]+"44"),
            borderRadius:"9px", padding:"13px 16px",
            display:"flex", alignItems:"center", gap:"12px",
            opacity: alert.resolved ? 0.6 : 1
          }}>
            <span style={{ fontSize:"16px", flexShrink:0 }}>{SEV_ICON[alert.severity]}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"13px", fontWeight: alert.resolved ? 400 : 600, marginBottom:"2px" }}>{alert.message}</div>
              <div style={{ fontSize:"11px", color:"#4a6278" }}>{alert.device} · {alert.time}</div>
            </div>
            <div style={{ display:"flex", gap:"6px", flexShrink:0 }}>
              {!alert.resolved && (
                <button onClick={() => resolve(alert.id)} style={{
                  background:"rgba(16,217,138,.12)", border:"1px solid rgba(16,217,138,.3)",
                  color:"#10d98a", borderRadius:"5px", padding:"4px 10px",
                  cursor:"pointer", fontSize:"11px", fontWeight:600
                }}>Resolve</button>
              )}
              <button onClick={() => dismiss(alert.id)} style={{
                background:"rgba(244,63,94,.08)", border:"1px solid rgba(244,63,94,.2)",
                color:"#f43f5e", borderRadius:"5px", padding:"4px 10px",
                cursor:"pointer", fontSize:"11px", fontWeight:600
              }}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
