import { useEffect, useState, useRef } from 'react'

const CATEGORIES = ['All', 'Markets', 'Geopolitical', 'Earnings', 'Alert']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'LIVE'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

function categoryColor(cat) {
  switch (cat) {
    case 'Markets':      return { color: '#70c0ff', bg: '#001428', border: '#003080' }
    case 'Geopolitical': return { color: '#ffaa40', bg: '#1a0e00', border: '#604000' }
    case 'Earnings':     return { color: '#a070ff', bg: '#0e0018', border: '#400080' }
    case 'Alert':        return { color: '#ff4444', bg: '#1a0000', border: '#600000' }
    default:             return { color: '#888',    bg: '#111',    border: '#333'    }
  }
}

export default function NewsFeed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  async function fetchNews() {
  try {
    const [newsRes, alertsRes] = await Promise.all([
      fetch('/api/news'),
      fetch('/api/alerts')
    ])
    const [newsData, alertsData] = await Promise.all([
      newsRes.json(),
      alertsRes.json()
    ])

    const newsArticles = (newsData.news || [])

    const alertArticles = (alertsData.alerts || []).map(a => ({
      ...a,
      isAlert: true,
    }))

    const combined = [...alertArticles, ...newsArticles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setArticles(combined)
    setLoading(false)
  } catch (err) {
    setError(err.message)
    setLoading(false)
  }
}

  useEffect(() => {
    fetchNews()
    intervalRef.current = setInterval(fetchNews, 90000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const filtered = category === 'All'
    ? articles
    : articles.filter(a => a.category === category)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>
            News Wire
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {CATEGORIES.map(cat => {
              const { color, bg, border } = categoryColor(cat)
              const active = category === cat
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--font)', letterSpacing: '0.04em', fontWeight: active ? 700 : 400,
                  background: active ? (cat === 'All' ? 'var(--blue-dim)' : bg) : 'transparent',
                  color: active ? (cat === 'All' ? 'var(--blue-text)' : color) : '#888',
                  border: active ? `1px solid ${cat === 'All' ? '#003080' : border}` : '1px solid transparent',
                  transition: 'all 0.15s',
                }}>{cat}</button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: '#888', letterSpacing: '0.05em' }}>
            {filtered.length} STORIES · 90s REFRESH
          </span>
          <button onClick={fetchNews} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING NEWS WIRE...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          ERROR: {error}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, color: '#555', fontSize: 12, textAlign: 'center', letterSpacing: '0.05em' }}>
              NO STORIES IN THIS CATEGORY
            </div>
          )}
          {filtered.map(article => {
            const { color, bg, border } = categoryColor(article.category)
            const isLive = Date.now() - new Date(article.created_at).getTime() < 300000
            return (
              <div key={article.id} style={{
                padding: '14px 20px',
                borderBottom: '1px solid #161616',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    {!article.isAlert && (
  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.06em', flexShrink: 0 }}>
      {article.category.toUpperCase()}
    </span>
)}
                    {article.isAlert ? (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em', flexShrink: 0 }}>
                        ⚡ ALERT
                      </span>
                    ) : isLive && !article.isAlert && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em', flexShrink: 0 }}>
                        LIVE
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#666' }}>
                      {article.source?.toUpperCase()} · {timeAgo(article.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: '#f0f0f0' }}>
                    {article.headline}
                  </div>
                </div>
                {article.url && (
                  <a href={article.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--blue-text)',
                    letterSpacing: '0.06em', textDecoration: 'none',
                    border: '1px solid var(--blue-dim)', padding: '6px 12px',
                    borderRadius: 6, whiteSpace: 'nowrap', flexShrink: 0,
                    background: 'var(--blue-dim)',
                  }}>
                    READ →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}