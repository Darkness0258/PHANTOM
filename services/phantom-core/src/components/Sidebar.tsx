import React from 'react'
import { useAppStore } from '../store/appStore'

const NAV = [
  { id:'home',     icon:'⌂', label:'Home'       },
  { id:'devices',  icon:'⊞', label:'Devices'    },
  { id:'ai',       icon:'◉', label:'PHANTOM AI' },
  { id:'security', icon:'⊘', label:'Security'   },
  { id:'settings', icon:'⚙', label:'Settings'   },
]

export default function Sidebar() {
  const { activePage, setPage } = useAppStore()

  return (
    <div style={{
      width:'52px', background:'#090d15',
      borderRight:'1px solid #141e2e',
      display:'flex', flexDirection:'column',
      alignItems:'center', padding:'14px 0', gap:'2px',
      transition:'width .25s',
    }}
    onMouseEnter={e => (e.currentTarget.style.width='196px')}
    onMouseLeave={e => (e.currentTarget.style.width='52px')}
    >
      {/* Logo */}
      <div style={{
        width:'34px', height:'34px', borderRadius:'9px',
        background:'linear-gradient(135deg,#00e5ff,#8b5cf6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:900, fontSize:'14px', color:'#000', marginBottom:'14px',
        flexShrink:0
      }}>PH</div>

      {NAV.map(n => (
        <div key={n.id}
          onClick={() => setPage(n.id)}
          style={{
            width:'calc(100% - 10px)', height:'38px',
            display:'flex', alignItems:'center', gap:'10px',
            padding:'0 9px', borderRadius:'8px', cursor:'pointer',
            color: activePage===n.id ? '#00e5ff' : '#4a6278',
            background: activePage===n.id ? 'rgba(0,229,255,.11)' : 'transparent',
            borderLeft: activePage===n.id ? '2px solid #00e5ff' : '2px solid transparent',
            whiteSpace:'nowrap', overflow:'hidden',
            transition:'all .15s'
          }}
        >
          <span style={{ fontSize:'17px', flexShrink:0, width:'22px', textAlign:'center' }}>{n.icon}</span>
          <span style={{ fontSize:'12.5px', fontWeight:600 }}>{n.label}</span>
        </div>
      ))}
    </div>
  )
}