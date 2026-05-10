import React, { useState } from 'react'

function Toggle({ label, on=true }: { label:string; on?:boolean }) {
  const [v, setV] = useState(on)
  const borderColor = v ? '#00e5ff' : '#1a2840'
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #141e2e' }}>
      <span style={{ fontSize:'12.5px' }}>{label}</span>
      <div onClick={() => setV(!v)} style={{
        width:'38px', height:'21px', borderRadius:'21px', cursor:'pointer',
        background: v ? 'rgba(0,229,255,.18)' : '#0d1420',
        border: '1px solid ' + borderColor,
        position:'relative', transition:'.25s'
      }}>
        <div style={{
          position:'absolute', width:'15px', height:'15px', borderRadius:'50%',
          background: v ? '#00e5ff' : '#3a4e63',
          top:'2px', left: v ? '19px' : '2px', transition:'.25s'
        }} />
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <div>
      <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>Settings</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        {[
          { title:'PHANTOM Agent', items:['Auto self-repair','Cross-device sync','Behavior learning','Silent auto-updates'] },
          { title:'Network',       items:['Auto-block unknowns','Deep traffic analysis','QoS prioritization','Unified storage pool'] },
          { title:'AI Training',   items:['Learn from usage','Ingest documents','Nightly fine-tune'] },
          { title:'Security',      items:['Firewall active','IDS / IPS','DNS filter','AES-256 encryption'] },
        ].map(sec => (
          <div key={sec.title} style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px' }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#3a4e63', marginBottom:'10px' }}>{sec.title}</div>
            {sec.items.map(item => <Toggle key={item} label={item} />)}
          </div>
        ))}
      </div>
    </div>
  )
}