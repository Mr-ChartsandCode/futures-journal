import { useEffect, useState, useRef } from 'react'

const CATEGORIES = ['All', 'Markets', 'Geopolitical', 'Earnings', 'Trump']

const ALLOWED_SOURCES = [
  'reuters', 'ap', 'associated press', 'bloomberg', 'benzinga',
  'dow jones', 'marketwire', 'pr newswire', 'globe newswire',
  'business wire', 'alpaca', 'truth_social'
]

const JUNK_PHRASES = [
  'invested in', 'years ago would', 'would be worth', 'if you invested',
  'should you buy', 'should i buy', 'why i am buying', 'why im buying',
  'top 10', 'top 5', 'top 3', 'best stocks', 'best etf', 'best funds',
  'stocks to buy', 'stocks to watch', 'stocks to sell', 'must buy',
  'you need to buy', 'you should buy', 'buy before', 'buy now',
  'missed out', 'wish i bought', 'shoulda', 'woulda',
  'prediction for', 'price target', 'analyst rating',
  'here is why', "here's why", 'reasons to buy', 'reasons to sell',
  'millionaire', 'retire early', 'get rich', 'passive income',
  'dividend kings', 'dividend aristocrat',
  'cathie wood', 'warren buffett bought', 'warren buffett sold',
  '1 stock', '2 stocks', '3 stocks', 'these stocks',
  'this stock could', 'this stock will', 'could make you',
  'better buy', 'vs.', ' vs ', 'which is better',
  'Heres How Much You Would Have Made', '$100 Invested In', '$1000 Invested In',
  'Trading Halt: Halted at', 
]

const MAJOR_TICKERS = new Set([
  'AAPL','MSFT','NVDA','AMZN','GOOGL','GOOG','META','TSLA','BRK','JPM',
  'V','UNH','XOM','JNJ','WMT','MA','PG','HD','CVX','MRK','ABBV','PEP',
  'KO','AVGO','COST','MCD','CSCO','ACN','LIN','TXN','DHR','ABT','NKE',
  'TMO','NEE','PM','ORCL','CRM','ADBE','QCOM','HON','IBM','LOW','AMGN',
  'UPS','CAT','GS','BA','SBUX','RTX','DE','SPGI','BLK','AXP','GILD',
  'MDT','T','VZ','BMY','LMT','ISRG','REGN','ZTS','SYK','PLD','CI',
  'CB','ADI','PANW','MU','KLAC','AMAT','LRCX','SNPS','CDNS','MELI',
  'NFLX','INTU','PYPL','INTC','AMD','UBER','ABNB','SHOP','SQ','SNOW',
  'NOW','WDAY','ZM','DOCU','CRWD','DDOG','NET','MDB','OKTA','TEAM',
  'COIN','HOOD','RIVN','LCID','F','GM','GE','MMM','AIG','BAC','WFC',
  'C','MS','USB','PNC','TFC','COF','AXP','DIS','CMCSA','NFLX','WBD',
  'PARA','FOX','NYT','SPY','QQQ','DIA','IWM','GLD','SLV','USO','TLT',
  'ES','NQ','YM','RTY','CL','GC','SI','NG','ZB','ZN','EUR','GBP','JPY',
  'SPX','NDX','DJIA','VIX','DXY'
])

function isRelevantEquity(article) {
  const text = (article.headline + ' ' + (article.summary || '')).toUpperCase()
  if (article.category === 'Geopolitical' || article.category === 'Trump') return true
  const tickerMatch = text.match(/\b([A-Z]{1,5})\b/g) || []
  if (tickerMatch.some(t => MAJOR_TICKERS.has(t))) return true
  const indexTerms = ['S&P', 'NASDAQ', 'DOW JONES', 'DOW ', 'NYSE', 'S&P 500', 'NASDAQ 100', 'RUSSELL', 'NIKKEI', 'FTSE', 'DAX', 'HANG SENG', 'FEDERAL RESERVE', 'FED ', 'FOMC', 'POWELL', 'YELLEN', 'TREASURY', 'YIELD', 'INFLATION', 'CPI', 'PCE', 'NFP', 'JOBS REPORT', 'GDP', 'OPEC', 'CRUDE OIL', 'NATURAL GAS', 'GOLD ', 'SILVER ', 'BITCOIN', 'ETHEREUM']
  return indexTerms.some(t => text.includes(t))
}

function isJunk(headline) {
  const h = headline.toLowerCase()
  return JUNK_PHRASES.some(p => h.includes(p))
}

function isAllowedSource(source) {
  if (!source) return false
  const s = source.toLowerCase()
  return ALLOWED_SOURCES.some(a => s.includes(a))
}

const MARKET_KEYWORDS = ['fed', 'federal reserve', 'rates', 'inflation', 'gdp', 'nasdaq', 's&p', 'dow', 'futures', 'stocks', 'bonds', 'yields', 'dollar', 'oil', 'gold', 'crypto', 'bitcoin', 'earnings', 'revenue', 'profit', 'ipo', 'merger', 'acquisition', 'market', 'trading', 'equity', 'commodity', 'treasury', 'fomc', 'powell', 'ecb', 'bank of england', 'bank of japan']
const GEO_KEYWORDS = ['war', 'sanctions', 'china', 'russia', 'ukraine', 'israel', 'iran', 'opec', 'nato', 'g7', 'g20', 'tariff', 'trade war', 'currency', 'central bank', 'imf', 'world bank', 'geopolit', 'military', 'conflict', 'election', 'president', 'congress', 'senate', 'policy', 'nuclear', 'missile', 'taiwan', 'north korea', 'middle east', 'ceasefire', 'embargo']
const EARNINGS_KEYWORDS = ['earnings', 'eps', 'revenue', 'quarterly', 'fiscal', 'beat', 'miss', 'forecast', 'outlook', 'dividend', 'buyback', 'guidance', 'results', 'q1', 'q2', 'q3', 'q4']

function categorize(article) {
  const text = (article.headline + ' ' + (article.summary || '')).toLowerCase()
  if (article.source === 'truth_social') return 'Trump'
  if (EARNINGS_KEYWORDS.some(k => text.includes(k))) return 'Earnings'
  if (GEO_KEYWORDS.some(k => text.includes(k))) return 'Geopolitical'
  if (MARKET_KEYWORDS.some(k => text.includes(k))) return 'Markets'
  return null
}

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
    case 'Markets':     return { color: '#70c0ff', bg: '#001428', border: '#003080' }
    case 'Geopolitical':return { color: '#ffaa40', bg: '#1a0e00', border: '#604000' }
    case 'Earnings':    return { color: '#a070ff', bg: '#0e0018', border: '#400080' }
    case 'Trump':       return { color: '#ff4444', bg: '#1a0000', border: '#600000' }
    default:            return { color: '#888',    bg: '#111',    border: '#333'    }
  }
}

async function fetchTrumpPosts() {
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://truthsocial.com/@realDonaldTrump.rss')
    const data = await res.json()
    if (!data.items) return []
    return data.items.slice(0, 10).map(item => ({
      id: item.guid,
      headline: item.description?.replace(/<[^>]+>/g, '').slice(0, 140) || item.title,
      summary: item.description?.replace(/<[^>]+>/g, ''),
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

      const alpacaArticles = (alpacaData.news || [])
        .filter(a => isAllowedSource(a.source))
        .filter(a => !isJunk(a.headline))
        .filter(a => !isJunk(a.headline))
        .filter(a => isRelevantEquity(a))
        .map(a => {
          const cat = categorize(a)
          if (!cat) return null
          return {
            id: a.id,
            headline: a.headline,
            summary: a.summary,
            source: a.source,
            author: a.author,
            url: a.url,
            created_at: a.created_at,
            category: cat,
          }
        })
        .filter(Boolean)

      const all = [...trumpPosts, ...alpacaArticles]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setArticles(all)
      if (!selected && all.length > 0) setSelected(all[0])
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>News Feed</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {CATEGORIES.map(cat => {
              const { color, bg, border } = categoryColor(cat)
              const active = category === cat
              return (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                  fontFamily: 'var(--font)', letterSpacing: '0.04em', fontWeight: active ? 700 : 400,
                  background: active ? (cat === 'All' ? 'var(--blue-dim)' : bg) : 'transparent',
                  color: active ? (cat === 'All' ? 'var(--blue-text)' : color) : 'var(--muted)',
                  border: active ? `1px solid ${cat === 'All' ? '#003080' : border}` : '1px solid transparent',
                  transition: 'all 0.15s',
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
            ↻ REFRESH
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
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>

          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 24, color: 'var(--muted)', fontSize: 12, textAlign: 'center', letterSpacing: '0.05em' }}>
                NO STORIES IN THIS CATEGORY
              </div>
            )}
            {filtered.map(article => {
              const { color, bg, border } = categoryColor(article.category)
              const isSelected = selected?.id === article.id
              const isLive = Date.now() - new Date(article.created_at).getTime() < 300000
              return (
                <div key={article.id} onClick={() => setSelected(article)} style={{
                  padding: '11px 14px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: isSelected ? '#0a0a18' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.06em', flexShrink: 0 }}>
                      {article.category.toUpperCase()}
                    </span>
                    {isLive && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em' }}>
                        LIVE
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.source?.toUpperCase().replace(/_/g, ' ')} · {timeAgo(article.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, lineHeight: 1.45, color: isSelected ? '#fff' : '#ccc' }}>
                    {article.headline}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ overflowY: 'auto', padding: '20px 24px', borderLeft: '1px solid var(--border)' }}>
            {selected ? (() => {
              const { color, bg, border } = categoryColor(selected.category)
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.06em' }}>
                      {selected.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {selected.source?.toUpperCase().replace(/_/g, ' ')} · {timeAgo(selected.created_at)}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.45, marginBottom: 14, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {selected.headline}
                  </h2>
                  {selected.author && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14, letterSpacing: '0.03em' }}>
                      BY {selected.author.toUpperCase()}
                    </div>
                  )}
                  <div style={{ width: 32, height: 2, background: 'var(--border2)', marginBottom: 16 }} />
                  <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.85, marginBottom: 24 }}>
                    {selected.summary || 'No preview available. Click below to read the full article.'}
                  </p>
                  {selected.url && (
                    <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--blue-text)', letterSpacing: '0.06em',
                      textDecoration: 'none', border: '1px solid var(--blue-dim)', padding: '8px 16px',
                      borderRadius: 6, display: 'inline-block', transition: 'border-color 0.15s',
                    }}>
                      READ FULL ARTICLE →
                    </a>
                  )}
                </>
              )
            })() : (
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