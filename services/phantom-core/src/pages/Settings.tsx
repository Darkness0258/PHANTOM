import React, { useState } from 'react'

function Toggle({ label, defaultOn=true }: { label:string; defaultOn?:boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #141e2e' }}>
      <span style={{ fontSize:'12.5px' }}>{label}</span>
      <div onClick={() => setOn(!on)} style={{
        width:'38px', height:'21px', borderRadius:'21px', cursor:'pointer',
        background: on ? 'rgba(0,229,255,.18)' : '#0d1420',
        border: `1px solid ${on ? '#00e5ff' : '#1a2840'}`,
        position:'relative', transition:'.25s'
      }}>
        <div style={{
          position:'absolute', width:'15px', height:'15px', borderRadius:'50%',
          background: on ? '#00e5ff' : '#3a4e63',
          top:'2px', left: on ? '19px' : '2px', transition:'.25s'
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
          { title:'PHANTOM Agent', items:['Auto self-repair','Cross-device sync','Behavior learning','Silent auto-updates','Agent spreading'] },
          { title:'Network',       items:['Auto-block unknowns','Deep traffic analysis','QoS prioritization','Predictive caching','Unified storage pool'] },
          { title:'AI Training',   items:['Learn from usage','Ingest documents','Voice adaptation','Nightly fine-tune'] },
          { title:'Security',      items:['Firewall active','IDS / IPS','DNS filter','AES-256 encryption','Zero-trust mode'] },
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