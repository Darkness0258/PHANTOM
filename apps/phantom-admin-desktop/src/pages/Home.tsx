import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [health, setHealth] = useState<string>('checking...')
  const [devices, setDevices] = useState<number>(0)

  useEffect(() => {
    axios.get('http://localhost:8000/health')
      .then(r => setHealth(r.data.status))
      .catch(() => setHealth('offline'))

    axios.get('http://localhost:8000/devices')
      .then(r => setDevices(r.data.count))
      .catch(() => {})
  }, [])

  const stats = [
    { label:'Core Status',    value: health.toUpperCase(), color: health==='ok'?'#10d98a':'#f43f5e' },
    { label:'Online Devices', value: devices || 8,         color:'#00e5ff' },
    { label:'VPN Tunnels',    value: 2,                    color:'#8b5cf6' },
    { label:'Alerts',         value: 3,                    color:'#fbbf24' },
  ]

  return (
    <div>
      <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>
        Network Overview
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'11px', marginBottom:'16px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'28px', fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#4a6278', marginTop:'4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px' }}>
        <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#3a4e63', marginBottom:'12px' }}>
          Service Status
        </div>
        {[
          { name:'phantom-core', port:'8000', status: health==='ok' ? 'Running' : 'Offline', color: health==='ok'?'#10d98a':'#f43f5e' },
          { name:'phantom-ai',   port:'8001', status:'Running', color:'#10d98a' },
          { name:'phantom-agent',port:'—',    status:'Ready',   color:'#fbbf24' },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom: i<2?'1px solid #141e2e':'none' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:s.color }} />
            <span style={{ fontSize:'12.5px', flex:1 }}>{s.name}</span>
            <span style={{ fontSize:'11px', fontFamily:'monospace', color:'#4a6278' }}>:{s.port}</span>
            <span style={{ fontSize:'11px', color:s.color }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}