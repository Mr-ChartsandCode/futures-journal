// AI Assistant token saving measures:

// Be specific in prompts — "analyze this ES 5min chart from today's open" gets a better answer than "what do you think"
// Include context in your message — tell it the timeframe, session, and what you were thinking. The AI can't see your platform settings.
// Challenge its analysis — if it says TAKE IT, ask "what would invalidate this setup?" Forces sharper thinking.
// Use it pre-trade — screenshot your setup before entering and ask "would you take this?" Good discipline tool.
// One topic per chat — psychology questions, chart analysis, and market structure should each be their own chat session for cleaner more focused answers.
// Ask for a score — end every chart analysis request with "rate this setup 1-10" so you get a consistent framework over time.

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Drawdown stage interrupt messages ───
const INTERRUPT_MESSAGES = {
  drawdown_3: "You're done for today. Close everything. Step away from the screen. We'll do the DRC in 30 minutes. No debate. No exceptions.",
  drawdown_2: (pct) => `You're at ${pct.toFixed(0)}% off your peak. This is the window where you've historically gone to full red. One more trade and we're having a different conversation. I need you to acknowledge what's happening before we discuss anything else.`,
  drawdown_1: (pct) => `You're at ${pct.toFixed(0)}% off your peak. How many trades since your high? Walk me through the last two.`,
  spiral: "Before your next trade — what size are you about to put on? I need you to say it out loud.",
  grind: "That's 3 attempts at the same level. That trade is dead for today. What's next on your watchlist?",
  overtrade: (n) => `That's trade number ${n} this segment. You know the rule. Are you still in a PTD setup or are you hunting?`,
}

// ─── Session state badge colors ───
function getDrawdownColor(stage) {
  if (stage >= 3) return '#ff2020'
  if (stage >= 2) return '#ff6600'
  if (stage >= 1) return '#ffaa00'
  return '#00cc66'
}

function getPnlColor(pnl) {
  if (pnl > 0) return '#00cc66'
  if (pnl < 0) return '#ff4040'
  return '#888'
}

// ─── Live State Header ───
function SessionHeader({ state }) {
  if (!state) return null

  const pnlColor = getPnlColor(state.realized_pnl_net)
  const ddColor = getDrawdownColor(state.drawdown_stage)
  const pnlStr = state.realized_pnl_net >= 0
    ? `+$${state.realized_pnl_net.toFixed(0)}`
    : `-$${Math.abs(state.realized_pnl_net).toFixed(0)}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px',
      borderBottom: '1px solid #1a1a1a', background: '#050505',
      fontSize: 12, fontFamily: 'var(--font)', flexWrap: 'wrap',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: ddColor,
          boxShadow: `0 0 6px ${ddColor}`,
          animation: state.drawdown_stage >= 2 ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }} />
        <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#555' }}>P&L</span>
        <span style={{ color: pnlColor, fontWeight: 700 }}>{pnlStr}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#555' }}>Peak</span>
        <span style={{ color: '#aaa' }}>${state.session_peak.toFixed(0)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#555' }}>DD</span>
        <span style={{ color: ddColor, fontWeight: 700 }}>{state.drawdown_from_peak.toFixed(0)}%</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#555' }}>Trades</span>
        <span style={{ color: '#aaa' }}>{state.total_trades}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#555' }}>Seg</span>
        <span style={{ color: '#aaa' }}>{state.current_segment}</span>
        <span style={{ color: state.trades_this_segment >= 4 ? '#ff6600' : '#666' }}>
          ({state.trades_this_segment})
        </span>
      </div>

      {/* Pattern flag badges */}
      {state.spiral_warning && (
        <span style={{ background: '#ff2020', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
          SPIRAL
        </span>
      )}
      {state.grind_warning && (
        <span style={{ background: '#ff6600', color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
          GRIND
        </span>
      )}
      {state.overtrade_warning && (
        <span style={{ background: '#ffaa00', color: '#000', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
          OVERTRADE
        </span>
      )}
    </div>
  )
}

// ─── Session Locked Banner (Stage 3) ───
function SessionLockedBanner() {
  return (
    <div style={{
      padding: '12px 16px', background: 'linear-gradient(135deg, #1a0000, #200000)',
      border: '1px solid #ff2020', borderRadius: 8, margin: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontSize: 20 }}>🛑</span>
      <div>
        <div style={{ color: '#ff4040', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}>
          SESSION CLOSED — DRAWDOWN STAGE 3
        </div>
        <div style={{ color: '#aa4040', fontSize: 12, marginTop: 2 }}>
          Trading is done for today. Step away. DRC in 30 minutes.
        </div>
      </div>
    </div>
  )
}

// ─── Message Component ───
function Message({ msg }) {
  const isUser = msg.role === 'user'
  const isInterrupt = msg.isInterrupt

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      gap: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: isInterrupt
            ? 'linear-gradient(135deg,#280000,#800000)'
            : 'linear-gradient(135deg,#001428,#003080)',
          border: `1px solid ${isInterrupt ? '#800000' : '#003080'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0, marginTop: 2,
        }}>{isInterrupt ? '⚠️' : '🤖'}</div>
      )}
      <div style={{
        maxWidth: '75%',
        background: isUser
          ? 'linear-gradient(135deg,#001428,#002060)'
          : isInterrupt
            ? 'linear-gradient(160deg,#1a0505,#0f0000)'
            : 'linear-gradient(160deg,#111,#0a0a0a)',
        border: `1px solid ${isUser ? '#003080' : isInterrupt ? '#401010' : '#1e1e1e'}`,
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        padding: '10px 14px',
        fontSize: 18,
        lineHeight: 1.6,
        color: isInterrupt ? '#ff8080' : '#e0e0e0',
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

// ─── Main Component ───
export default function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hey! I'm your AI trading coach. Sierra Chart feed is live — I'm watching your fills in real time.",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [userId, setUserId] = useState(null)
  const [sessionState, setSessionState] = useState(null)
  const [sessionLocked, setSessionLocked] = useState(false)

  // Track which interrupts have already fired so we don't repeat them
  const firedInterrupts = useRef(new Set())

  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)

  // ─── Auth ───
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id)
    })
  }, [])

  // ─── Auto-scroll ───
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ─── Interrupt logic ───
  const fireInterrupt = useCallback((message) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: message,
      isInterrupt: true,
    }])
  }, [])

  const processInterrupts = useCallback((state) => {
    if (!state) return

    const fired = firedInterrupts.current

    // Priority 1: Drawdown Stage 3 — Full Stop
    if (state.drawdown_stage >= 3 && !fired.has('dd3')) {
      fired.add('dd3')
      setSessionLocked(true)
      fireInterrupt(INTERRUPT_MESSAGES.drawdown_3)
      return // highest priority, don't fire others
    }

    // Priority 2: Drawdown Stage 2 — Escalation
    if (state.drawdown_stage >= 2 && !fired.has('dd2')) {
      fired.add('dd2')
      fireInterrupt(INTERRUPT_MESSAGES.drawdown_2(state.drawdown_from_peak))
      return
    }

    // Priority 3: Drawdown Stage 1 — Early Warning
    if (state.drawdown_stage >= 1 && !fired.has('dd1')) {
      fired.add('dd1')
      fireInterrupt(INTERRUPT_MESSAGES.drawdown_1(state.drawdown_from_peak))
      return
    }

    // Priority 4: Spiral Warning
    if (state.spiral_warning && !fired.has('spiral')) {
      fired.add('spiral')
      fireInterrupt(INTERRUPT_MESSAGES.spiral)
      return
    }

    // Priority 5: Grind Warning
    if (state.grind_warning && !fired.has('grind')) {
      fired.add('grind')
      fireInterrupt(INTERRUPT_MESSAGES.grind)
      return
    }

    // Priority 6: Overtrade Warning
    if (state.overtrade_warning && !fired.has('overtrade')) {
      fired.add('overtrade')
      fireInterrupt(INTERRUPT_MESSAGES.overtrade(state.trades_this_segment))
      return
    }
  }, [fireInterrupt])

  // ─── Supabase Realtime Subscription ───
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    // Fetch initial state
    supabase
      .from('session_state')
      .select('*')
      .eq('session_date', today)
      .single()
      .then(({ data }) => {
        if (data) {
          setSessionState(data)
          if (data.drawdown_stage >= 3) setSessionLocked(true)
        }
      })

    // Subscribe to realtime changes
    const channel = supabase
      .channel('session_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_state',
          filter: `session_date=eq.${today}`,
        },
        (payload) => {
          const newState = payload.new
          setSessionState(newState)
          processInterrupts(newState)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [processInterrupts])

  // ─── Send Message ───
  async function sendMessage(content, image = null) {
    if (!content.trim() && !image) return

    // If session is locked (Stage 3), only allow DRC-related messages
    if (sessionLocked) {
      const lower = content.toLowerCase()
      const isDrc = lower.includes('drc') || lower.includes('eod') || lower.includes('end of day') || lower.includes('report card')
      if (!isDrc) {
        setMessages(prev => [...prev,
          { role: 'user', content, image },
          {
            role: 'assistant',
            content: "No. The session is closed. I told you — step away from the screen. When you're ready, ask me for your DRC. That's the only conversation we're having right now.",
            isInterrupt: true,
          }
        ])
        setInput('')
        setPendingImage(null)
        return
      }
    }

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
          sessionState, // pass current live state to API
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

  // ─── File Upload ───
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
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result
        const preview = text.slice(0, 3000)
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

      {/* ─── Title Bar ─── */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', color: '#f0f0f0', textTransform: 'uppercase' }}>
            AI Trading Coach
          </span>
          <button onClick={() => {
            setMessages([{ role: 'assistant', content: "Hey! I'm your AI trading coach. Sierra Chart feed is live — I'm watching your fills in real time." }])
            firedInterrupts.current = new Set()
            // Don't reset sessionLocked — that persists based on state
          }}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)' }}>
            NEW CHAT
          </button>
        </div>
      </div>

      {/* ─── Live Session State Header ─── */}
      <SessionHeader state={sessionState} />

      {/* ─── Session Locked Banner ─── */}
      {sessionLocked && <SessionLockedBanner />}

      {/* ─── Messages ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#001428,#003080)', border: '1px solid #003080', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#70c0ff', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s`, opacity: 0.7 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 16px', background: '#000', flexShrink: 0 }}>
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
            placeholder={sessionLocked
              ? "Session closed. Type 'DRC' for your daily report card..."
              : "Ask about your trades, paste a chart, or ask anything market-related... (Enter to send, Shift+Enter for new line)"
            }
            rows={2}
            style={{
              flex: 1, fontSize: 17, padding: '8px 12px', background: '#0a0a0a',
              border: `1px solid ${sessionLocked ? '#401010' : '#2a2a2a'}`, borderRadius: 6, color: '#f0f0f0',
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
