import React from 'react'

export default function Topbar() {
  return (
    <div style={{
      background:'#090d15', borderBottom:'1px solid #141e2e',
      padding:'10px 22px', display:'flex', alignItems:'center', gap:'14px'
    }}>
      <div>
        <div style={{ fontSize:'17px', fontWeight:700, letterSpacing:'.5px' }}>
          PHANTOM ADMIN
        </div>
        <div style={{ fontSize:'11px', color:'#4a6278', fontFamily:'monospace' }}>
          192.168.1.1 · Local Network
        </div>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
        <div style={{
          width:'7px', height:'7px', borderRadius:'50%',
          background:'#10d98a', animation:'pulse 2s infinite'
        }} />
        <span style={{ fontSize:'11.5px', color:'#4a6278' }}>Live</span>
      </div>
      <div style={{
        width:'30px', height:'30px', borderRadius:'50%',
        background:'linear-gradient(135deg,#00e5ff,#8b5cf6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'12px', fontWeight:800, color:'#000'
      }}>D</div>
    </div>
  )
}