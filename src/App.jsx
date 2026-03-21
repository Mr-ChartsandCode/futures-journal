import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import AddTrade from './pages/AddTrade'
import TradeDetail from './pages/TradeDetail'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  async function handleLogin() {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  if (loading) return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading...</div>

  if (!session) return (
  <div style={{ maxWidth: 340, margin: '8rem auto', padding: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font)' }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>FuturesJournal</div>
    {error && <p style={{ color: 'var(--red)', fontSize: 11, marginBottom: 10, letterSpacing: '0.03em' }}>{error}</p>}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13 }} />
      <button onClick={handleLogin} style={{ padding: '9px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', marginTop: 4 }}>
        SIGN IN
      </button>
    </div>
  </div>
)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddTrade />} />
        <Route path="/trade/:id" element={<TradeDetail />} />
      </Routes>
    </BrowserRouter>
  )
}