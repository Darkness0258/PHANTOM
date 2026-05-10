import React, { useEffect, useRef, useState, useCallback } from 'react'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import axios from 'axios'

const CORE = 'http://localhost:8000'

const CLIENT_CONF = `[Interface]
PrivateKey = CMR3itEqOHwIx+2MkOLA6NmmqxKyq7KlcEoqON8o0E4=
Address = 10.8.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = h+hBFvokzwH5V4vtY06aqidVbYCefiu3KfXCFKLuV04=
Endpoint = 182.182.170.161:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`

interface NetworkDevice {
  ip:       string
  hostname: string
  status:   string
  mac?:     string
  vendor?:  string
}

function getDeviceIcon(device: NetworkDevice): string {
  const h = (device.hostname + (device.vendor || '')).toLowerCase()
  if (h.includes('router') || device.ip.endsWith('.1'))  return '🌐'
  if (h.includes('phone') || h.includes('android') || h.includes('mobile')) return '📱'
  if (h.includes('tv') || h.includes('samsung') || h.includes('lg'))        return '📺'
  if (h.includes('printer'))                                                 return '🖨️'
  return '💻'
}

function getDeviceColor(device: NetworkDevice): string {
  const h = (device.hostname + (device.vendor || '')).toLowerCase()
  if (device.ip.endsWith('.1'))                                               return '#00e5ff'
  if (h.includes('phone') || h.includes('android') || h.includes('mobile')) return '#8b5cf6'
  if (h.includes('tv') || h.includes('samsung'))                             return '#10d98a'
  return '#8b5cf6'
}

export default function NetworkMap() {
  const canvasRef                         = useRef<HTMLCanvasElement>(null)
  const animRef                           = useRef<number>()
  const [showQR, setShowQR]               = useState(false)
  const [devices, setDevices]             = useState<NetworkDevice[]>([])
  const [scanning, setScanning]           = useState(false)
  const [lastScan, setLastScan]           = useState<string>('')
  const devicesRef                        = useRef<NetworkDevice[]>([])

  const fetchScan = useCallback(async () => {
    setScanning(true)
    try {
      const res = await axios.get(`${CORE}/network/scan`)
      const list: NetworkDevice[] = res.data.devices || []
      setDevices(list)
      devicesRef.current = list
      setLastScan(new Date().toLocaleTimeString())
    } catch {
      // core offline
    } finally {
      setScanning(false)
    }
  }, [])

  // Auto-scan on mount + every 60s
  useEffect(() => {
    fetchScan()
    const interval = setInterval(fetchScan, 60000)
    return () => clearInterval(interval)
  }, [fetchScan])

  // Canvas draw
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    cv.width  = cv.parentElement!.clientWidth
    cv.height = 460
    const W = cv.width, H = cv.height
    const cx = W / 2, cy = H / 2

    // Build nodes from real devices
    const buildNodes = () => {
      const list = devicesRef.current
      if (list.length === 0) {
        return [
          { l: '🌐 Scanning...', x: cx, y: cy, c: '#475569', r: 22 }
        ]
      }
      return list.map((d, i) => {
        const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2
        const radius = i === 0 ? 0 : 160
        return {
          l: `${getDeviceIcon(d)} ${d.ip}`,
          x: i === 0 ? cx : cx + Math.cos(angle) * radius,
          y: i === 0 ? cy : cy + Math.sin(angle) * radius,
          c: getDeviceColor(d),
          r: i === 0 ? 26 : 18,
          vendor: d.vendor || '',
        }
      })
    }

    const pkts: any[]   = []
    const colors        = ['#00e5ff', '#8b5cf6', '#10d98a', '#fbbf24']

    const pktInterval = setInterval(() => {
      const nodes = buildNodes()
      if (nodes.length < 2) return
      const to   = 1 + Math.floor(Math.random() * (nodes.length - 1))
      const rev  = Math.random() > .5
      pkts.push({
        from: rev ? to : 0,
        to:   rev ? 0  : to,
        t: 0, sp: .015 + Math.random() * .015,
        c: colors[Math.floor(Math.random() * colors.length)],
        nodes,
      })
    }, 500)

    function draw() {
      const nodes = buildNodes()
      ctx.clearRect(0, 0, W, H)

      // Grid dots
      ctx.fillStyle = 'rgba(20,30,46,.3)'
      for (let x = 20; x < W; x += 40)
        for (let y = 20; y < H; y += 40) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
        }

      // Edges from router (node 0) to all others
      nodes.slice(1).forEach(n => {
        ctx.beginPath()
        ctx.moveTo(nodes[0].x, nodes[0].y)
        ctx.lineTo(n.x, n.y)
        ctx.strokeStyle = 'rgba(24,36,54,.9)'
        ctx.lineWidth   = 1.5
        ctx.stroke()
      })

      // Packets
      for (let i = pkts.length - 1; i >= 0; i--) {
        const p = pkts[i]; p.t += p.sp
        if (p.t > 1) { pkts.splice(i, 1); continue }
        const fn = p.nodes[p.from], tn = p.nodes[p.to]
        if (!fn || !tn) { pkts.splice(i, 1); continue }
        const x = fn.x + (tn.x - fn.x) * p.t
        const y = fn.y + (tn.y - fn.y) * p.t
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle   = p.c
        ctx.shadowColor = p.c; ctx.shadowBlur = 12
        ctx.fill(); ctx.shadowBlur = 0
      }

      // Nodes
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7, 0, Math.PI * 2)
        ctx.fillStyle = n.c + '18'; ctx.fill()
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = '#0c1420'; ctx.fill()
        ctx.strokeStyle = n.c; ctx.lineWidth = 1.8; ctx.stroke()
        ctx.fillStyle   = '#dde4ef'
        ctx.font        = '10.5px Segoe UI'
        ctx.textAlign   = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(n.l, n.x, n.y + n.r + 6)
        if ('vendor' in n && n.vendor) {
          ctx.fillStyle = '#4a6278'
          ctx.font      = '9px Segoe UI'
          ctx.fillText(n.vendor.slice(0, 14), n.x, n.y + n.r + 18)
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      clearInterval(pktInterval)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [devices])

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
        <div style={{ fontSize:'15px', fontWeight:600 }}>
          Live Network Map
          {lastScan && <span style={{ fontSize:'11px', color:'#4a6278', marginLeft:'10px' }}>Last scan: {lastScan}</span>}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={fetchScan} disabled={scanning} style={{
            background: scanning ? 'rgba(16,217,138,.05)' : 'rgba(16,217,138,.1)',
            border:'1px solid rgba(16,217,138,.3)',
            color:'#10d98a', borderRadius:'6px',
            padding:'5px 13px', cursor: scanning ? 'wait' : 'pointer',
            fontSize:'12px', fontWeight:600
          }}>
            {scanning ? '⟳ Scanning...' : '⟳ Scan Now'}
          </button>
          <button onClick={() => setShowQR(!showQR)} style={{
            background:'rgba(0,229,255,.1)',
            border:'1px solid rgba(0,229,255,.3)',
            color:'#00e5ff', borderRadius:'6px',
            padding:'5px 13px', cursor:'pointer',
            fontSize:'12px', fontWeight:600
          }}>
            {showQR ? 'Hide QR' : '📱 VPN QR Code'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', overflow:'hidden', marginBottom:'14px' }}>
        <canvas ref={canvasRef} style={{ display:'block', width:'100%' }} />
      </div>

      {/* Device table */}
      {devices.length > 0 && (
        <div style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'11px', marginBottom:'14px', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #141e2e', fontSize:'12px', fontWeight:600, color:'#4a6278' }}>
            DISCOVERED DEVICES ({devices.length})
          </div>
          {devices.map((d, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'24px 1fr 1fr 1fr',
              padding:'10px 16px', borderBottom:'1px solid #0e1825',
              fontSize:'12px', alignItems:'center', gap:'12px'
            }}>
              <span style={{ fontSize:'16px' }}>{getDeviceIcon(d)}</span>
              <span style={{ color:'#dde4ef', fontFamily:'monospace' }}>{d.ip}</span>
              <span style={{ color:'#4a6278' }}>{d.mac || '—'}</span>
              <span style={{ color:'#3a4e63' }}>{d.vendor || 'Unknown'}</span>
            </div>
          ))}
        </div>
      )}

      {/* VPN QR */}
      {showQR && (
        <div style={{ background:'#0b1019', border:'1px solid rgba(0,229,255,.3)', borderRadius:'11px', padding:'20px', marginBottom:'14px', display:'flex', gap:'24px', alignItems:'center' }}>
          <div style={{ background:'white', padding:'12px', borderRadius:'8px' }}>
            <QRCode value={CLIENT_CONF} size={160} />
          </div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'8px' }}>📱 Connect Your Phone to PHANTOM VPN</div>
            <div style={{ fontSize:'12px', color:'#4a6278', lineHeight:1.8 }}>
              1. Install <span style={{ color:'#00e5ff' }}>WireGuard</span> on your phone<br/>
              2. Tap <span style={{ color:'#00e5ff' }}>+</span> → Scan QR code<br/>
              3. Toggle the tunnel ON<br/>
              4. You are on PHANTOM VPN 🔒
            </div>
            <div style={{ marginTop:'10px', fontSize:'11px', fontFamily:'monospace', color:'#fbbf24' }}>
              Endpoint: 182.182.170.161:51820 · WireGuard
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'11px' }}>
        {[
          { label:'Devices Found',      value: devices.length || '—', color:'#00e5ff', sub:'on 192.168.1.0/24' },
          { label:'Active Connections', value: devices.length > 0 ? `${devices.length} live` : '—', color:'#8b5cf6', sub:'nmap -sn scan' },
          { label:'VPN Tunnel',         value:'ACTIVE', color:'#10d98a', sub:'Port 51820' },
        ].map(s => (
          <div key={s.label} style={{ background:'#0b1019', border:'1px solid #141e2e', borderRadius:'9px', padding:'14px' }}>
            <div style={{ fontSize:'22px', fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#4a6278', marginTop:'2px' }}>{s.label}</div>
            <div style={{ fontSize:'10px', color:'#3a4e63', marginTop:'4px' }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}