import React, { useState } from 'react'
import axios from 'axios'

interface Msg { role:'user'|'ai'; text:string }

export default function PhantomAI() {
  const [msgs,    setMsgs]    = useState<Msg[]>([
    { role:'ai', text:"I'm live. Full network visibility active. What do you need?" }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMsgs(m => [...m, { role:'user', text:userMsg }])
    setLoading(true)

    try {
      const res = await axios.post('http://localhost:8001/chat', { message: userMsg })
      setMsgs(m => [...m, { role:'ai', text: res.data }])
    } catch {
      setMsgs(m => [...m, { role:'ai', text:'AI service not responding. Make sure phantom-ai is running on port 8001.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 120px)' }}>
      <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'14px' }}>PHANTOM AI</div>

      {/* Messages */}
      <div style={{
        flex:1, background:'#0b1019', border:'1px solid #141e2e',
        borderRadius:'11px 11px 0 0', padding:'14px',
        overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px'
      }}>
        {msgs.map((m,i) => (
          <div key={i} style={{
            alignSelf: m.role==='user' ? 'flex-end' : 'flex-start',
            maxWidth:'80%', padding:'9px 13px', borderRadius:'10px',
            background: m.role==='user' ? 'rgba(0,229,255,.13)' : '#111927',
            border: m.role==='user' ? '1px solid rgba(0,229,255,.28)' : '1px solid #141e2e',
            fontSize:'13px', lineHeight:1.55
          }}>
            <div style={{ fontSize:'10px', color:'#3a4e63', marginBottom:'3px', textTransform:'uppercase' }}>
              {m.role==='user' ? 'You' : 'PHANTOM AI'}
            </div>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:'flex-start', color:'#4a6278', fontSize:'12px' }}>
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        display:'flex', gap:'9px', padding:'12px',
        background:'#0b1019', border:'1px solid #141e2e',
        borderTop:'none', borderRadius:'0 0 11px 11px'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && send()}
          placeholder="Ask anything about your network..."
          style={{
            flex:1, background:'#0d1420', border:'1px solid #1a2840',
            borderRadius:'8px', padding:'9px 13px', color:'#dde4ef',
            fontSize:'13.5px', outline:'none'
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background:'#00e5ff', color:'#000', border:'none',
          borderRadius:'8px', padding:'9px 18px',
          fontWeight:700, cursor:'pointer', fontSize:'13px'
        }}>Send</button>
      </div>
    </div>
  )
}