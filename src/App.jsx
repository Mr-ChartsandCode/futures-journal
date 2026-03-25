import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AddTrade from './pages/AddTrade'
import TradeDetail from './pages/TradeDetail'
import EditTrade from './pages/EditTrade'
import Analytics from './pages/Analytics'
import SectorHeatmap from './pages/SectorHeatmap'
import StockMovers from './pages/StockMovers'
import Fundamentals from './pages/Fundamentals'
import EconCalendar from './pages/EconCalendar'
import NewsFeed from './pages/NewsFeed'
import AIAssistant from './pages/AIAssistant'

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

  if (loading) return (
    <div style={{ padding: 40, fontFamily: 'var(--font)', color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>
      LOADING...
    </div>
  )

  if (!session) return (
    <div style={{ maxWidth: 340, margin: '8rem auto', padding: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Futures Terminal</div>
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
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddTrade />} />
          <Route path="/trade/:id" element={<TradeDetail />} />
          <Route path="/trade/:id/edit" element={<EditTrade />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sectors" element={<SectorHeatmap />} />
          <Route path="/movers" element={<StockMovers />} />
          <Route path="/fundamentals" element={<Fundamentals />} />
          <Route path="/calendar" element={<EconCalendar />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/ai" element={<AIAssistant />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}