import React from 'react'
export default function Security() {
  return (
    <div>
      <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>Security Center</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'14px' }}>
        {[{l:'Threat Level',v:'LOW',c:'#10d98a'},{l:'Blocked Today',v:'3',c:'#f43f5e'},{l:'Active Rules',v:'12',c:'#00e5ff'}].map(s => (
          <div key={s.l} style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'26px', fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'11px', color:'#4a6278', marginTop:'4px' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', padding:'16px' }}>
        <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#3a4e63', marginBottom:'12px' }}>Event Log</div>
        {[
          { time:'14:32', event:'Unknown device scan blocked', src:'192.168.1.99', action:'Blocked', color:'#f43f5e' },
          { time:'09:15', event:'External port scan detected', src:'45.33.32.156', action:'Blocked', color:'#f43f5e' },
          { time:'Yesterday', event:'Malware URL blocked', src:'Ahmed-Tablet', action:'Quarantined', color:'#fbbf24' },
        ].map((e,i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'80px 1fr 120px 100px', gap:'10px', padding:'8px 0', borderBottom:'1px solid #141e2e', fontSize:'12px' }}>
            <span style={{ color:'#4a6278', fontFamily:'monospace' }}>{e.time}</span>
            <span>{e.event}</span>
            <span style={{ fontFamily:'monospace', color:'#4a6278' }}>{e.src}</span>
            <span style={{ color:e.color }}>{e.action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
