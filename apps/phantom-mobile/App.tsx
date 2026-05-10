import React, { useEffect, useState, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl, TextInput
} from 'react-native'
import axios from 'axios'
import * as Notifications from 'expo-notifications'

const CORE_LOCAL = 'http://192.168.1.9:8000'
const CORE_VPN   = 'http://10.8.0.1:8000'
const AI_LOCAL   = 'http://192.168.1.9:8001'
const AI_VPN     = 'http://10.8.0.1:8001'

const C = {
  bg:      '#070a10',
  bg2:     '#0c1118',
  card:    '#0f1520',
  border:  '#182436',
  cyan:    '#00e5ff',
  purple:  '#8b5cf6',
  green:   '#10d98a',
  yellow:  '#fbbf24',
  red:     '#f43f5e',
  text:    '#dde4ef',
  muted:   '#4a6278',
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

// Auto-detect best URL
async function getCoreUrl(): Promise<string> {
  try {
    await axios.get(CORE_LOCAL + '/health', { timeout: 2000 })
    return CORE_LOCAL
  } catch {
    return CORE_VPN
  }
}

async function getAiUrl(): Promise<string> {
  try {
    await axios.get(AI_LOCAL + '/health', { timeout: 2000 })
    return AI_LOCAL
  } catch {
    return AI_VPN
  }
}

async function registerForPushNotifications(coreUrl: string) {
  try {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return
    const token = await Notifications.getExpoPushTokenAsync({ projectId: 'phantom-local' })
    await axios.post(coreUrl + '/push/register', { token: token.data }, { timeout: 5000 })
  } catch (e) {
    console.log('Push registration failed:', e)
  }
}

function getDeviceIcon(device: any): string {
  const h = ((device.hostname || '') + (device.vendor || '')).toLowerCase()
  if (device.ip?.endsWith('.1'))                                              return '🌐'
  if (h.includes('phone') || h.includes('android') || h.includes('mobile')) return '📱'
  if (h.includes('tv') || h.includes('samsung') || h.includes('lg'))        return '📺'
  if (h.includes('printer'))                                                 return '🖨️'
  return '💻'
}

// ── SCREENS ──────────────────────────────────────
function HomeScreen({ core }: { core: string }) {
  const [status,  setStatus]  = useState('checking...')
  const [devices, setDevices] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [url,     setUrl]     = useState(core)

  const load = async () => {
    const activeUrl = await getCoreUrl()
    setUrl(activeUrl)
    try {
      const r = await axios.get(activeUrl + '/health', { timeout: 3000 })
      setStatus(r.data.status)
      const d = await axios.get(activeUrl + '/devices', { timeout: 3000 })
      setDevices(d.data.count || 0)
    } catch { setStatus('offline') }
    setRefresh(false)
  }

  useEffect(() => { load() }, [])

  const stats = [
    { label:'Core',    value: status.toUpperCase(), color: status==='ok'?C.green:C.red },
    { label:'Devices', value: String(devices),       color: C.cyan   },
    { label:'VPN',     value: 'ACTIVE',              color: C.green  },
    { label:'Alerts',  value: '3',                   color: C.yellow },
  ]

  return (
    <ScrollView
      style={s.screen}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); load() }} tintColor={C.cyan} />}
    >
      <Text style={s.pageTitle}>Network Overview</Text>
      <Text style={{ color: C.muted, fontSize: 10, marginBottom: 12, fontFamily: 'monospace' }}>
        {url === CORE_LOCAL ? '📡 Local WiFi' : '🔒 VPN Mode'} · {url}
      </Text>
      <View style={s.grid2}>
        {stats.map(st => (
          <View key={st.label} style={s.statCard}>
            <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>SERVICE STATUS</Text>
        {[
          { name:'phantom-core',  ok: status==='ok' },
          { name:'phantom-ai',    ok: true },
          { name:'phantom-agent', ok: true },
        ].map(sv => (
          <View key={sv.name} style={s.row}>
            <View style={[s.dot, { backgroundColor: sv.ok ? C.green : C.red }]} />
            <Text style={s.rowText}>{sv.name}</Text>
            <Text style={[s.rowSub, { color: sv.ok ? C.green : C.red }]}>{sv.ok ? 'Running' : 'Offline'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function DevicesScreen({ core }: { core: string }) {
  const [agentDevices, setAgentDevices] = useState<any[]>([])
  const [nmapDevices,  setNmapDevices]  = useState<any[]>([])
  const [scanning,     setScanning]     = useState(false)
  const [lastScan,     setLastScan]     = useState('')
  const [tab,          setTab]          = useState<'agent'|'network'>('network')
  const [refresh,      setRefresh]      = useState(false)

  const loadAgent = async () => {
    const url = await getCoreUrl()
    try {
      const r = await axios.get(url + '/devices', { timeout: 3000 })
      setAgentDevices(r.data.devices || [])
    } catch {}
  }

  const loadNmap = async () => {
    setScanning(true)
    const url = await getCoreUrl()
    try {
      const r = await axios.get(url + '/network/scan/cached', { timeout: 5000 })
      setNmapDevices(r.data.devices || [])
      setLastScan(new Date().toLocaleTimeString())
    } catch {}
    setScanning(false)
  }

  const loadAll = async () => {
    await Promise.all([loadAgent(), loadNmap()])
    setRefresh(false)
  }

  useEffect(() => { loadAll() }, [])

  return (
    <ScrollView
      style={s.screen}
      refreshControl={<RefreshControl refreshing={refresh} onRefresh={() => { setRefresh(true); loadAll() }} tintColor={C.cyan} />}
    >
      <Text style={s.pageTitle}>Devices</Text>
      <View style={s.tabSwitch}>
        <TouchableOpacity style={[s.tabSwitchBtn, tab==='network' && s.tabSwitchActive]} onPress={() => setTab('network')}>
          <Text style={[s.tabSwitchText, { color: tab==='network' ? C.cyan : C.muted }]}>🌐 Network ({nmapDevices.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabSwitchBtn, tab==='agent' && s.tabSwitchActive]} onPress={() => setTab('agent')}>
          <Text style={[s.tabSwitchText, { color: tab==='agent' ? C.cyan : C.muted }]}>💻 Agents ({agentDevices.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'network' && (
        <TouchableOpacity style={[s.scanBtn, scanning && { opacity: 0.5 }]} onPress={loadNmap} disabled={scanning}>
          <Text style={{ color: C.green, fontWeight: '700', fontSize: 13 }}>{scanning ? '⟳ Scanning LAN...' : '⟳ Scan Now'}</Text>
          {lastScan ? <Text style={{ color: C.muted, fontSize: 10 }}>Last: {lastScan}</Text> : null}
        </TouchableOpacity>
      )}

      {tab === 'network' && (
        <>
          {nmapDevices.length === 0 && !scanning && (
            <View style={s.card}><Text style={{ color: C.muted, textAlign: 'center' }}>No devices found. Pull to refresh.</Text></View>
          )}
          {nmapDevices.map((d, i) => (
            <View key={i} style={s.card}>
              <View style={s.row}>
                <Text style={{ fontSize: 22 }}>{getDeviceIcon(d)}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.deviceName}>{d.ip}</Text>
                  <Text style={s.deviceSub}>{d.mac || 'No MAC'}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: 'rgba(16,217,138,.15)' }]}>
                  <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>UP</Text>
                </View>
              </View>
              {d.vendor && d.vendor !== 'Unknown' && <Text style={[s.rowSub, { marginTop: 6 }]}>Vendor: {d.vendor}</Text>}
              {d.hostname && d.hostname !== d.ip && <Text style={[s.rowSub, { marginTop: 2 }]}>Host: {d.hostname}</Text>}
            </View>
          ))}
        </>
      )}

      {tab === 'agent' && (
        <>
          {agentDevices.length === 0 && (
            <View style={s.card}><Text style={{ color: C.muted, textAlign: 'center' }}>No agents. Start phantom-agent.</Text></View>
          )}
          {agentDevices.map(d => (
            <View key={d.id} style={s.card}>
              <View style={s.row}>
                <Text style={{ fontSize: 22 }}>💻</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.deviceName}>{d.name}</Text>
                  <Text style={s.deviceSub}>{d.id?.slice(0, 16)}...</Text>
                </View>
                <View style={[s.badge, { backgroundColor: 'rgba(16,217,138,.15)' }]}>
                  <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>LIVE</Text>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <View style={s.barRow}>
                  <Text style={s.barLabel}>CPU</Text>
                  <Text style={[s.barVal, { color: d.cpu_usage>80?C.red:d.cpu_usage>50?C.yellow:C.green }]}>{d.cpu_usage?.toFixed(1)}%</Text>
                </View>
                <View style={s.barBg}><View style={[s.barFill, { width: d.cpu_usage+'%', backgroundColor: d.cpu_usage>80?C.red:d.cpu_usage>50?C.yellow:C.green }]} /></View>
                <View style={[s.barRow, { marginTop: 8 }]}>
                  <Text style={s.barLabel}>RAM</Text>
                  <Text style={[s.barVal, { color: d.ram_percent>80?C.red:d.ram_percent>60?C.yellow:C.purple }]}>{d.ram_percent}%</Text>
                </View>
                <View style={s.barBg}><View style={[s.barFill, { width: d.ram_percent+'%', backgroundColor: C.purple }]} /></View>
              </View>
              <Text style={[s.rowSub, { marginTop: 8 }]}>Last seen: {new Date(d.last_seen).toLocaleTimeString()}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  )
}

function AIScreen() {
  const [msgs,    setMsgs]    = useState([{ role:'ai', text:'PHANTOM AI online. What do you need?' }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const msg = input.trim(); setInput(''); setLoading(true)
    setMsgs(m => [...m, { role:'user', text: msg }])
    try {
      const aiUrl = await getAiUrl()
      const r = await axios.post(aiUrl + '/chat', { message: msg }, { timeout: 30000 })
      setMsgs(m => [...m, { role:'ai', text: r.data }])
    } catch {
      setMsgs(m => [...m, { role:'ai', text:'AI service offline.' }])
    }
    setLoading(false)
  }

  return (
    <View style={[s.screen, { padding: 16 }]}>
      <Text style={s.pageTitle}>PHANTOM AI</Text>
      <ScrollView style={{ flex: 1, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <View key={i} style={[s.bubble, m.role==='user' ? s.bubbleUser : s.bubbleAI]}>
            <Text style={[s.bubbleLabel, { color: m.role==='user' ? C.cyan : C.muted }]}>{m.role==='user' ? 'You' : 'PHANTOM AI'}</Text>
            <Text style={s.bubbleText}>{m.text}</Text>
          </View>
        ))}
        {loading && <Text style={{ color: C.muted, padding: 8 }}>Thinking...</Text>}
      </ScrollView>
      <View style={s.inputRow}>
        <TextInput style={s.input} value={input} onChangeText={setInput} placeholder="Ask anything..." placeholderTextColor={C.muted} onSubmitEditing={send} />
        <TouchableOpacity style={s.sendBtn} onPress={send} disabled={loading}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 13 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function VPNScreen() {
  const [connected, setConnected] = useState(false)
  return (
    <ScrollView style={s.screen}>
      <Text style={s.pageTitle}>PHANTOM VPN</Text>
      <View style={[s.card, { alignItems: 'center', paddingVertical: 30 }]}>
        <View style={[s.vpnCircle, { borderColor: connected ? C.green : C.muted }]}>
          <Text style={{ fontSize: 36 }}>🔒</Text>
        </View>
        <Text style={[s.statVal, { color: connected ? C.green : C.muted, marginTop: 14 }]}>{connected ? 'CONNECTED' : 'DISCONNECTED'}</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{connected ? '10.8.0.2 · WireGuard' : 'Tap to connect'}</Text>
        <TouchableOpacity style={[s.vpnBtn, { backgroundColor: connected?'rgba(244,63,94,.15)':'rgba(0,229,255,.15)', borderColor: connected?C.red:C.cyan }]} onPress={() => setConnected(!connected)}>
          <Text style={{ color: connected ? C.red : C.cyan, fontWeight: '700', fontSize: 14 }}>{connected ? 'Disconnect' : 'Connect'}</Text>
        </TouchableOpacity>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>VPN SERVER</Text>
        {[
          { l:'Endpoint', v:'182.182.170.161:51820' },
          { l:'Protocol', v:'WireGuard'             },
          { l:'DNS',      v:'1.1.1.1'               },
          { l:'Status',   v:'Server Active'         },
        ].map(item => (
          <View key={item.l} style={s.row}>
            <Text style={s.barLabel}>{item.l}</Text>
            <Text style={{ color: C.text, fontSize: 12 }}>{item.v}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// ── TAB NAV ──────────────────────────────────────
export default function App() {
  const [tab,  setTab]  = useState('home')
  const [core, setCore] = useState(CORE_LOCAL)

  useEffect(() => {
    getCoreUrl().then(url => {
      setCore(url)
      registerForPushNotifications(url)
    })
  }, [])

  const screens: Record<string, JSX.Element> = {
    home:    <HomeScreen core={core} />,
    devices: <DevicesScreen core={core} />,
    ai:      <AIScreen />,
    vpn:     <VPNScreen />,
  }

  const TABS = [
    { id:'home',    label:'Home',    icon:'⌂' },
    { id:'devices', label:'Devices', icon:'⊞' },
    { id:'ai',      label:'AI',      icon:'◉' },
    { id:'vpn',     label:'VPN',     icon:'🔒' },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={s.topbar}>
        <View style={[s.dot, { backgroundColor: C.green, width: 8, height: 8 }]} />
        <Text style={s.topbarTitle}>PHANTOM</Text>
        <Text style={{ color: C.muted, fontSize: 11 }}>● Live</Text>
      </View>
      <View style={{ flex: 1 }}>{screens[tab]}</View>
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={s.tabItem} onPress={() => setTab(t.id)}>
            <Text style={{ fontSize: 20, opacity: tab===t.id ? 1 : 0.4 }}>{t.icon}</Text>
            <Text style={[s.tabLabel, { color: tab===t.id ? C.cyan : C.muted }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  screen:          { flex:1, backgroundColor:C.bg, padding:16 },
  pageTitle:       { color:C.text, fontSize:17, fontWeight:'700', marginBottom:8 },
  topbar:          { backgroundColor:C.bg2, borderBottomWidth:1, borderBottomColor:C.border, padding:14, flexDirection:'row', alignItems:'center', gap:8, paddingTop:50 },
  topbarTitle:     { color:C.text, fontSize:16, fontWeight:'800', letterSpacing:2, flex:1 },
  card:            { backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:11, padding:14, marginBottom:12 },
  cardTitle:       { color:C.muted, fontSize:10, letterSpacing:1, marginBottom:10, textTransform:'uppercase' },
  grid2:           { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:12 },
  statCard:        { backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:9, padding:14, flex:1, minWidth:'45%', alignItems:'center' },
  statVal:         { fontSize:22, fontWeight:'700', color:C.cyan },
  statLabel:       { color:C.muted, fontSize:11, marginTop:3 },
  row:             { flexDirection:'row', alignItems:'center', paddingVertical:6, borderBottomWidth:1, borderBottomColor:C.border },
  rowText:         { color:C.text, fontSize:13, flex:1, marginLeft:8 },
  rowSub:          { color:C.muted, fontSize:11 },
  dot:             { width:7, height:7, borderRadius:4 },
  badge:           { paddingHorizontal:8, paddingVertical:3, borderRadius:5 },
  deviceName:      { color:C.text, fontSize:13, fontWeight:'600' },
  deviceSub:       { color:C.muted, fontSize:10, fontFamily:'monospace' },
  barRow:          { flexDirection:'row', justifyContent:'space-between', marginBottom:3 },
  barLabel:        { color:C.muted, fontSize:11 },
  barVal:          { fontSize:11 },
  barBg:           { height:4, backgroundColor:C.border, borderRadius:2, overflow:'hidden' },
  barFill:         { height:4, borderRadius:2 },
  bubble:          { padding:10, borderRadius:10, marginBottom:8, maxWidth:'85%' },
  bubbleUser:      { backgroundColor:'rgba(0,229,255,.1)', borderWidth:1, borderColor:'rgba(0,229,255,.25)', alignSelf:'flex-end' },
  bubbleAI:        { backgroundColor:C.card, borderWidth:1, borderColor:C.border, alignSelf:'flex-start' },
  bubbleLabel:     { fontSize:9, textTransform:'uppercase', marginBottom:3 },
  bubbleText:      { color:C.text, fontSize:13, lineHeight:19 },
  inputRow:        { flexDirection:'row', gap:8 },
  input:           { flex:1, backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:8, padding:10, color:C.text, fontSize:13 },
  sendBtn:         { backgroundColor:C.cyan, borderRadius:8, paddingHorizontal:16, justifyContent:'center' },
  tabBar:          { flexDirection:'row', backgroundColor:C.bg2, borderTopWidth:1, borderTopColor:C.border, paddingBottom:20, paddingTop:8 },
  tabItem:         { flex:1, alignItems:'center', gap:3 },
  tabLabel:        { fontSize:10, fontWeight:'600' },
  vpnCircle:       { width:100, height:100, borderRadius:50, borderWidth:3, alignItems:'center', justifyContent:'center' },
  vpnBtn:          { marginTop:16, paddingHorizontal:32, paddingVertical:12, borderRadius:8, borderWidth:1 },
  tabSwitch:       { flexDirection:'row', backgroundColor:C.card, borderRadius:9, borderWidth:1, borderColor:C.border, marginBottom:12, overflow:'hidden' },
  tabSwitchBtn:    { flex:1, paddingVertical:10, alignItems:'center' },
  tabSwitchActive: { backgroundColor:'rgba(0,229,255,.08)', borderBottomWidth:2, borderBottomColor:C.cyan },
  tabSwitchText:   { fontSize:12, fontWeight:'700' },
  scanBtn:         { backgroundColor:C.card, borderWidth:1, borderColor:'rgba(16,217,138,.3)', borderRadius:9, padding:12, marginBottom:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
})