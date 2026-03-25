import { useEffect, useState, useRef } from 'react'

const CATEGORIES = ['All', 'Markets', 'Geopolitical', 'Earnings', 'Trump']

const MARKET_KEYWORDS = ['fed', 'rates', 'inflation', 'gdp', 'nasdaq', 's&p', 'dow', 'futures', 'stocks', 'bonds', 'yields', 'dollar', 'oil', 'gold', 'crypto', 'bitcoin', 'earnings', 'revenue', 'profit', 'ipo', 'merger', 'acquisition', 'market', 'trading', 'hedge', 'equity', 'commodity']
const GEO_KEYWORDS = ['war', 'sanctions', 'china', 'russia', 'ukraine', 'israel', 'iran', 'opec', 'nato', 'g7', 'g20', 'tariff', 'trade war', 'currency', 'central bank', 'imf', 'world bank', 'geopolit', 'military', 'conflict', 'election', 'president', 'congress', 'senate', 'policy']
const EARNINGS_KEYWORDS = ['earnings', 'eps', 'revenue', 'guidance', 'quarter', 'fiscal', 'profit', 'loss', 'beat', 'miss', 'forecast', 'outlook', 'dividend', 'buyback']

function categorize(article) {
  const text = (article.headline + ' ' + (article.summary || '')).toLowerCase()
  if (article.source === 'truth_social') return 'Trump'
  if (EARNINGS_KEYWORDS.some(k => text.includes(k))) return 'Earnings'
  if (GEO_KEYWORDS.some(k => text.includes(k))) return 'Geopolitical'
  if (MARKET_KEYWORDS.some(k => text.includes(k))) return 'Markets'
  return 'Markets'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

function categoryColor(cat) {
  switch (cat) {
    case 'Markets': return { color: '#70c0ff', bg: '#001428' }
    case 'Geopolitical': return { color: '#ffaa40', bg: '#1a0e00' }
    case 'Earnings': return { color: '#a070ff', bg: '#0e0018' }
    case 'Trump': return { color: '#ff4444', bg: '#1a0000' }
    default: return { color: '#888', bg: '#111' }
  }
}

async function fetchTrumpPosts() {
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://truthsocial.com/@realDonaldTrump.rss`)
    const data = await res.json()
    if (!data.items) return []
    return data.items.slice(0, 10).map(item => ({
      id: item.guid,
      headline: item.title || item.description?.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
      summary: item.description?.replace(/<[^>]+>/g, '').slice(0, 400),
      source: 'truth_social',
      author: 'Donald J. Trump',
      url: item.link,
      created_at: item.pubDate,
      category: 'Trump',
    }))
  } catch { return [] }
}

export default function NewsFeed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('All')
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  async function fetchNews() {
    try {
      const [alpacaRes, trumpPosts] = await Promise.all([
        fetch('/api/news'),
        fetchTrumpPosts()
      ])
      const alpacaData = await alpacaRes.json()
      const alpacaArticles = (alpacaData.news || []).map(a => ({
        id: a.id,
        headline: a.headline,
        summary: a.summary,
        source: a.source,
        author: a.author,
        url: a.url,
        created_at: a.created_at,
        category: categorize(a),
      }))
      const all = [...trumpPosts, ...alpacaArticles]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setArticles(all)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    intervalRef.current = setInterval(fetchNews, 120000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const filtered = category === 'All' ? articles : articles.filter(a => a.category === category)

  const label = { fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>News Feed</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {CATEGORIES.map(cat => {
              const { color } = categoryColor(cat)
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font)', letterSpacing: '0.04em', fontWeight: category === cat ? 700 : 400,
                  background: category === cat ? (cat === 'All' ? 'var(--blue-dim)' : categoryColor(cat).bg) : 'transparent',
                  color: category === cat ? (cat === 'All' ? 'var(--blue-text)' : color) : 'var(--muted)',
                  border: category === cat ? `1px solid ${cat === 'All' ? '#003080' : color}40` : '1px solid transparent',
                }}>{cat}</button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>
            {filtered.length} STORIES · AUTO-REFRESH 2MIN
          </span>
          <button onClick={fetchNews} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING NEWS...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          ERROR: {error}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>

          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            {filtered.map((article, i) => {
              const { color, bg } = categoryColor(article.category)
              const isSelected = selected?.id === article.id
              return (
                <div key={article.id} onClick={() => setSelected(article)} style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: isSelected ? '#0a0a1a' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: bg, color, letterSpacing: '0.06em', flexShrink: 0 }}>
                      {article.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.source?.toUpperCase().replace('_', ' ')} · {timeAgo(article.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, lineHeight: 1.45, color: isSelected ? 'var(--text)' : '#ccc' }}>
                    {article.headline}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  {(() => { const { color, bg } = categoryColor(selected.category); return (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: bg, color, letterSpacing: '0.06em' }}>
                      {selected.category.toUpperCase()}
                    </span>
                  )})()}
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {selected.source?.toUpperCase().replace('_', ' ')} · {timeAgo(selected.created_at)}
                  </span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 16, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  {selected.headline}
                </h2>
                {selected.author && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16, letterSpacing: '0.03em' }}>
                    BY {selected.author.toUpperCase()}
                  </div>
                )}
                <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.8, marginBottom: 24 }}>
                  {selected.summary || 'No preview available for this article.'}
                </p>
                {selected.url && (
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--blue-text)', letterSpacing: '0.06em',
                    textDecoration: 'none', border: '1px solid var(--blue-dim)', padding: '8px 16px',
                    borderRadius: 6, display: 'inline-block',
                  }}>
                    READ FULL ARTICLE →
                  </a>
                )}
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>
                SELECT A STORY TO PREVIEW
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}