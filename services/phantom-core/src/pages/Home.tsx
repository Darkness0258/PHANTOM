import React from 'react'
import { useAppStore } from '../store/appStore'

export default function Home() {
  const devices = useAppStore(s => s.devices)
  const online  = devices.filter(d => d.status === 'online').length

  const stats = [
    { label:'Online Devices', value: online || 8,  color:'#00e5ff' },
    { label:'Threats Today',  value: 0,             color:'#10d98a' },
    { label:'VPN Tunnels',    value: 2,             color:'#8b5cf6' },
    { label:'Alerts',         value: 3,             color:'#fbbf24' },
  ]

  return (
    <div>
      <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>
        Network Overview
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'11px', marginBottom:'16px' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background:'#0b1019', border:'1px solid #141e2e',
            borderRadius:'11px', padding:'16px', textAlign:'center'
          }}>
            <div style={{ fontSize:'28px', fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#4a6278', marginTop:'4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px' }}>
        <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#3a4e63', marginBottom:'12px' }}>
          Recent Alerts
        </div>
        {[
          { dot:'#fbbf24', msg:'High memory on Laptop-01',          time:'10 min ago' },
          { dot:'#f43f5e', msg:'Unknown device blocked',            time:'2 hrs ago'  },
          { dot:'#00e5ff', msg:"Ahmed's tablet exceeded screen time", time:'4 hrs ago'  },
        ].map((a,i) => (
          <div key={i} style={{
            display:'flex', alignItems:'flex-start', gap:'9px',
            padding:'8px 0', borderBottom: i<2 ? '1px solid #141e2e' : 'none'
          }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:a.dot, marginTop:'4px', flexShrink:0 }} />
            <div>
              <div style={{ fontSize:'12.5px' }}>{a.msg}</div>
              <div style={{ fontSize:'11px', color:'#4a6278' }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}