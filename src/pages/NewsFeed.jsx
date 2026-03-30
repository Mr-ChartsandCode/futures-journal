import { useEffect, useState, useRef } from 'react'

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


export default function NewsFeed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
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

  const filtered = articles

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>
            News Wire
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: '#888', letterSpacing: '0.05em' }}>
            {filtered.length} STORIES · AUTO REFRESH
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
                    {article.isAlert ? (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em', flexShrink: 0 }}>
                        ⚡ ALERT
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#0a0a1a', color: '#70c0ff', border: '1px solid #003080', letterSpacing: '0.06em', flexShrink: 0 }}>
                        {article.source?.toUpperCase()}
                      </span>
                    )}
                    {isLive && !article.isAlert && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em', flexShrink: 0 }}>
                        LIVE
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#666' }}>
                      {timeAgo(article.created_at)}
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