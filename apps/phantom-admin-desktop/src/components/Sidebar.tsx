import React from 'react'
import { useAppStore } from '../store/appStore'
const NAV = [
  { id:'parental', icon:'♡', label:'Parental' },
  { id:'home',     icon:'⌂', label:'Home'       },
  { id:'map',      icon:'◈', label:'Network Map' },
  { id:'devices',  icon:'⊞', label:'Devices'     },
  { id:'ai',       icon:'◉', label:'PHANTOM AI'  },
  { id:'security', icon:'⊘', label:'Security'    },
  { id:'settings', icon:'⚙', label:'Settings'    },
  { id:'alerts', icon:'🔔', label:'Alerts' },
]
export default function Sidebar() {
  const { activePage, setPage } = useAppStore()
  return (
    <div style={{ width:'52px', background:'#090d15', borderRight:'1px solid #141e2e', display:'flex', flexDirection:'column', alignItems:'center', padding:'14px 0', gap:'2px' }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'linear-gradient(135deg,#00e5ff,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'14px', color:'#000', marginBottom:'14px' }}>PH</div>
      {NAV.map(n => (
        <div key={n.id} onClick={() => setPage(n.id)} title={n.label} style={{ width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', cursor:'pointer', fontSize:'17px', color: activePage===n.id ? '#00e5ff' : '#4a6278', background: activePage===n.id ? 'rgba(0,229,255,.11)' : 'transparent', transition:'all .15s' }}>
          {n.icon}
        </div>
      ))}
    </div>
  )
}
