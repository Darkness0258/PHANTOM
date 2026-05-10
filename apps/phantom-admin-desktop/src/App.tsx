import React from 'react'
import { useAppStore } from './store/appStore'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import Devices from './pages/Devices'
import PhantomAI from './pages/PhantomAI'
import Security from './pages/Security'
import Settings from './pages/Settings'
import NetworkMap from './pages/NetworkMap'
import Parental from './pages/Parental'
import Alerts from './pages/Alerts'

const PAGES: Record<string, React.ReactNode> = {
  home:     <Home />,
  map:      <NetworkMap />,
  devices:  <Devices />,
  ai:       <PhantomAI />,
  security: <Security />,
  settings: <Settings />,
  parental: <Parental />,
  alerts: <Alerts />,
}
export default function App() {
  const activePage = useAppStore(s => s.activePage)
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar />
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {PAGES[activePage] ?? <Home />}
        </div>
      </div>
    </div>
  )
}
