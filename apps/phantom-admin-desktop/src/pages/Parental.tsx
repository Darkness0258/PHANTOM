import React, { useEffect, useState } from 'react'
import axios from 'axios'

const CORE = 'http://localhost:8000'

interface Device {
  name:    string
  ip:      string
  mac:     string
  blocked: boolean
}

function Toggle({ on, onChange, loading }: { on: boolean; onChange: () => void; loading?: boolean }) {
  return (
    <div onClick={!loading ? onChange : undefined} style={{
      width: '48px', height: '26px', borderRadius: '26px',
      cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
      background: on ? 'rgba(244,63,94,.2)' : 'rgba(16,217,138,.15)',
      border: '1px solid ' + (on ? '#f43f5e' : '#10d98a'),
      position: 'relative', transition: '.25s', opacity: loading ? 0.6 : 1
    }}>
      <div style={{
        position: 'absolute', width: '18px', height: '18px', borderRadius: '50%',
        background: on ? '#f43f5e' : '#10d98a',
        top: '3px', left: on ? '26px' : '3px', transition: '.25s'
      }} />
    </div>
  )
}

function getIcon(name: string, mac: string): string {
  const n = name.toLowerCase()
  const m = mac.toLowerCase()
  if (n.includes('grandfather') || (n.includes('grand') && n.includes('f'))) return '👴'
  if (n.includes('grandmother') || (n.includes('grand') && n.includes('m'))) return '👵'
  if (n.includes('father') || n.includes('dad')) return '👨'
  if (n.includes('mother') || n.includes('mom')) return '👩'
  if (n.includes('brother')) return '👦'
  if (n.includes('sister'))  return '👧'
  if (n.includes('tv') || m.includes('samsung')) return '📺'
  if (n.includes('tablet') || n.includes('ipad')) return '📱'
  return '📱'
}

export default function Parental() {
  const [devices,  setDevices]  = useState<Device[]>([])
  const [loading,  setLoading]  = useState<Record<string, boolean>>({})
  const [editing,  setEditing]  = useState<string | null>(null)
  const [newName,  setNewName]  = useState('')
  const [fetching, setFetching] = useState(true)
  const [scanning, setScanning] = useState(false)

  const load = async () => {
    try {
      const r = await axios.get(CORE + '/parental/devices')
      setDevices(r.data.devices || [])
    } catch {}
    setFetching(false)
  }

  const rescan = async () => {
    setScanning(true)
    try {
      await axios.get(CORE + '/network/scan', { timeout: 60000 })
      await load()
    } catch {}
    setScanning(false)
  }

  useEffect(() => { load() }, [])

  const toggleBlock = async (device: Device) => {
    setLoading(prev => ({ ...prev, [device.ip]: true }))
    try {
      const r = await axios.post(CORE + '/parental/block', { ip: device.ip, block: !device.blocked })
      setDevices(prev => prev.map(d => d.ip === device.ip ? { ...d, blocked: r.data.blocked } : d))
    } catch {
      alert('Failed. Make sure PHANTOM is running as Administrator.')
    }
    setLoading(prev => ({ ...prev, [device.ip]: false }))
  }

  const renameDevice = async (ip: string) => {
    if (!newName.trim()) return
    try {
      await axios.post(CORE + '/parental/rename', { ip, name: newName.trim() })
      setDevices(prev => prev.map(d => d.ip === ip ? { ...d, name: newName.trim() } : d))
    } catch {}
    setEditing(null)
    setNewName('')
  }

  const blocked = devices.filter(d => d.blocked).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600 }}>Parental Controls</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {blocked > 0 && <span style={{ fontSize: '12px', color: '#f43f5e' }}>🚫 {blocked} blocked</span>}
          <button onClick={rescan} disabled={scanning} style={{
            background: 'rgba(16,217,138,.1)', border: '1px solid rgba(16,217,138,.3)',
            color: '#10d98a', borderRadius: '6px', padding: '5px 12px',
            cursor: scanning ? 'wait' : 'pointer', fontSize: '12px', fontWeight: 600
          }}>
            {scanning ? '⟳ Scanning...' : '⟳ Scan Network'}
          </button>
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: 'rgba(0,229,255,.05)', border: '1px solid rgba(0,229,255,.15)', borderRadius: '9px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10d98a' }} />
        <span style={{ fontSize: '12px', color: '#4a6278' }}>
          Auto-detects all devices on your network · Click ✏️ to rename · Toggle to block/allow internet
        </span>
      </div>

      {fetching ? (
        <div style={{ color: '#4a6278', textAlign: 'center', padding: '40px' }}>Loading devices...</div>
      ) : devices.length === 0 ? (
        <div style={{ background: '#0b1019', border: '1px solid #141e2e', borderRadius: '11px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
          <div style={{ color: '#4a6278', marginBottom: '12px' }}>No devices found. Run a network scan first.</div>
          <button onClick={rescan} style={{ background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', color: '#00e5ff', borderRadius: '6px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
            Scan Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
          {devices.map(device => (
            <div key={device.ip} style={{
              background: '#0b1019',
              border: `1px solid ${device.blocked ? 'rgba(244,63,94,.3)' : '#141e2e'}`,
              borderRadius: '11px', padding: '14px',
              transition: 'border-color .3s'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: device.blocked ? 'rgba(244,63,94,.15)' : 'rgba(16,217,138,.1)',
                  border: `1px solid ${device.blocked ? '#f43f5e' : '#10d98a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>{getIcon(device.name, device.mac)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing === device.ip ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        autoFocus
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') renameDevice(device.ip); if (e.key === 'Escape') setEditing(null) }}
                        style={{ flex: 1, background: '#0c1420', border: '1px solid #00e5ff', borderRadius: '4px', color: '#dde4ef', padding: '2px 6px', fontSize: '11px' }}
                      />
                      <button onClick={() => renameDevice(device.ip)} style={{ background: '#00e5ff', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✓</button>
                    </div>
                  ) : (
                    <div onClick={() => { setEditing(device.ip); setNewName(device.name) }}
                      style={{ fontWeight: 600, fontSize: '12px', cursor: 'pointer', color: '#dde4ef' }}
                      title="Click to rename"
                    >{device.name} ✏️</div>
                  )}
                  <div style={{ fontSize: '10px', color: '#4a6278', fontFamily: 'monospace' }}>{device.ip}</div>
                  {device.mac && <div style={{ fontSize: '9px', color: '#3a4e63', fontFamily: 'monospace' }}>{device.mac}</div>}
                </div>
              </div>

              {/* Status */}
              <div style={{
                padding: '5px 10px', borderRadius: '6px', marginBottom: '10px',
                background: device.blocked ? 'rgba(244,63,94,.08)' : 'rgba(16,217,138,.08)',
                border: `1px solid ${device.blocked ? 'rgba(244,63,94,.2)' : 'rgba(16,217,138,.2)'}`,
                fontSize: '11px', color: device.blocked ? '#f43f5e' : '#10d98a', fontWeight: 600
              }}>
                {device.blocked ? '🚫 BLOCKED' : '✅ ALLOWED'}
              </div>

              {/* Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#4a6278' }}>{device.blocked ? 'Unblock' : 'Block'}</span>
                <Toggle on={device.blocked} onChange={() => toggleBlock(device)} loading={loading[device.ip]} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div style={{ background: '#0b1019', border: '1px solid #141e2e', borderRadius: '11px', padding: '14px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#3a4e63', marginBottom: '10px' }}>How It Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { icon: '🔍', label: 'Auto Discovery',   sub: 'Finds all network devices' },
            { icon: '🔥', label: 'Real Enforcement', sub: 'Windows Firewall rules'    },
            { icon: '⚡', label: 'Instant Effect',   sub: 'No device restart needed'  },
            { icon: '✏️', label: 'Rename Devices',   sub: 'Click name to customize'   },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '12px', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: '#4a6278' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}