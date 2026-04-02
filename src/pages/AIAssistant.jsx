// AI Assistant token saving measures:

// Be specific in prompts — "analyze this ES 5min chart from today's open" gets a better answer than "what do you think"
// Include context in your message — tell it the timeframe, session, and what you were thinking. The AI can't see your platform settings.
// Challenge its analysis — if it says TAKE IT, ask "what would invalidate this setup?" Forces sharper thinking.
// Use it pre-trade — screenshot your setup before entering and ask "would you take this?" Good discipline tool.
// One topic per chat — psychology questions, chart analysis, and market structure should each be their own chat session for cleaner more focused answers.
// Ask for a score — end every chart analysis request with "rate this setup 1-10" so you get a consistent framework over time.

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'



function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      gap: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#001428,#003080)',
          border: '1px solid #003080', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, marginTop: 2,
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '75%',
        background: isUser ? 'linear-gradient(135deg,#001428,#002060)' : 'linear-gradient(160deg,#111,#0a0a0a)',
        border: `1px solid ${isUser ? '#003080' : '#1e1e1e'}`,
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        padding: '10px 14px',
        fontSize: 18,
        lineHeight: 1.6,
        color: '#e0e0e0',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.image && (
          <img src={`data:${msg.image.mediaType};base64,${msg.image.data}`}
            alt="chart" style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />
        )}
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#001428',
          border: '1px solid #003080', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, marginTop: 2,
        }}>👤</div>
      )}
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hey! I'm your AI trading coach.",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })
  }, [])
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(content, image = null) {
    if (!content.trim() && !image) return

    const userMsg = { role: 'user', content, image }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setPendingImage(null)
    setLoading(true)

    try {
      const apiMessages = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          image: image || null,
          userId,
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    }
    setLoading(false)
  }

function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        setPendingImage({ data: base64, mediaType: file.type })
      }
      reader.readAsDataURL(file)
    } else {
      // CSV or text file — read as text and inject into message
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result
        const preview = text.slice(0, 3000) // limit to avoid token explosion
        setInput(prev =>
          prev
            ? `${prev}\n\n[CSV DATA]\n${preview}`
            : `Here is my trade data from today:\n\n[CSV DATA]\n${preview}`
        )
      }
      reader.readAsText(file)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input, pendingImage)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', color: '#f0f0f0', textTransform: 'uppercase' }}>
            AI Trading Coach
          </span>
          <button onClick={() => setMessages([{ role: 'assistant', content: "Hey! I'm your AI trading coach." }])}
          style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)' }}>
          NEW CHAT
        </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#001428,#003080)', border: '1px solid #003080', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#70c0ff', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s`, opacity: 0.7 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 16px', background: '#000', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        </div>

        {pendingImage && (
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={`data:${pendingImage.mediaType};base64,${pendingImage.data}`}
              alt="pending" style={{ height: 48, borderRadius: 4, border: '1px solid #003080' }} />
            <span style={{ fontSize: 15, color: '#70c0ff' }}>Chart attached</span>
            <button onClick={() => setPendingImage(null)} style={{ fontSize: 15, color: '#ff6060', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button onClick={() => fileRef.current?.click()} style={{
            padding: '8px 10px', borderRadius: 6, border: '1px solid #1e1e1e',
            background: '#0a0a0a', color: '#666', cursor: 'pointer', fontSize: 20, flexShrink: 0,
          }}>📎</button>
          <input ref={fileRef} type="file" accept="image/*,.csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your trades, paste a chart, or ask anything market-related... (Enter to send, Shift+Enter for new line)"
            rows={2}
            style={{
              flex: 1, fontSize: 17, padding: '8px 12px', background: '#0a0a0a',
              border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0f0f0',
              resize: 'none', fontFamily: 'var(--font)', lineHeight: 1.5,
              outline: 'none',
            }}
          />

          <button
            onClick={() => sendMessage(input, pendingImage)}
            disabled={loading || (!input.trim() && !pendingImage)}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: loading ? 'default' : 'pointer',
              background: loading || (!input.trim() && !pendingImage) ? '#001020' : 'linear-gradient(135deg,#001428,#003080)',
              color: loading || (!input.trim() && !pendingImage) ? '#333' : '#70c0ff',
              fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >SEND</button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}