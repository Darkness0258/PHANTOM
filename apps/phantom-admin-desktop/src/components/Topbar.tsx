import React from 'react'
export default function Topbar() {
  return (
    <div style={{ background:'#090d15', borderBottom:'1px solid #141e2e', padding:'10px 22px', display:'flex', alignItems:'center', gap:'14px' }}>
      <div>
        <div style={{ fontSize:'17px', fontWeight:700 }}>PHANTOM ADMIN</div>
        <div style={{ fontSize:'11px', color:'#4a6278' }}>Local Network · All Systems Operational</div>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#10d98a' }} />
      <span style={{ fontSize:'11px', color:'#4a6278' }}>Live</span>
      <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#00e5ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#000', fontSize:'12px' }}>D</div>
    </div>
  )
}
