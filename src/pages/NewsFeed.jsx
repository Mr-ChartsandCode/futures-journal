import { useEffect, useState, useRef } from 'react'

const CATEGORIES = ['All', 'Markets', 'Geopolitical', 'Earnings']

const JUNK_PHRASES = [
  'invested in', 'years ago would', 'would be worth', 'if you invested',
  'should you buy', 'should i buy', 'why im buying',
  'top 10', 'top 5', 'top 3', 'best stocks', 'best etf',
  'stocks to buy', 'stocks to watch', 'must buy',
  'here is why', "here's why", 'reasons to buy', 'reasons to sell',
  'millionaire', 'retire early', 'get rich', 'passive income',
  'how to invest', 'how to trade', 'for beginners',
  'what you need to know', 'everything you need',
  'better buy', 'which is better',
  'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'dogecoin',
]

const EARNINGS_JUNK = [
  'preview', 'what to expect', 'ahead of earnings',
  'before earnings', 'earnings playbook', 'how to trade earnings',
]

const MEGA_CAP_TICKERS = new Set([
  'AAPL','MSFT','NVDA','AMZN','GOOGL','GOOG','META','TSLA',
  'JPM','V','UNH','XOM','JNJ','WMT','MA','PG','HD','CVX',
  'MRK','ABBV','PEP','KO','AVGO','COST','MCD','CSCO','ACN',
  'LIN','TXN','DHR','ABT','NKE','TMO','NEE','PM','ORCL','CRM',
  'ADBE','QCOM','HON','IBM','LOW','AMGN','UPS','CAT','GS','BA',
  'SBUX','RTX','DE','SPGI','BLK','AXP','GILD','MDT','T','VZ',
  'BMY','LMT','ISRG','REGN','ZTS','SYK','AMD','INTC','NFLX',
  'DIS','CMCSA','F','GM','GE','BAC','WFC','C','MS',
  'SPY','QQQ','DIA','IWM','GLD','USO','TLT',
  'ES','NQ','YM','RTY','CL','GC','SI','NG','ZB','ZN',
  'EUR','GBP','JPY','DXY','SPX','NDX','DJIA','VIX',
])

const ALWAYS_PASS = [
  'federal reserve','fed reserve','the fed','fomc','powell',
  'interest rate','rate hike','rate cut','rate decision',
  'inflation','cpi','pce','ppi','nonfarm','jobs report','gdp',
  'treasury','yield curve','bond market',
  'oil price','crude oil','natural gas','opec','oil and gas','lng',
  'gold price','silver price',
  's&p 500','nasdaq','dow jones','nyse','russell',
  'tariff','trade war','trade deal','trade deficit',
  'dollar index','euro zone','eurozone','ecb','boj','boe','imf','world bank',
  'war','military strike','airstrike','missile','nuclear','nuclear energy',
  'sanctions','embargo','ceasefire','conflict','explosion',
  'china','russia','ukraine','israel','iran','taiwan','north korea',
  'middle east','gulf','strait of hormuz','kremlin',
  'election','white house','white house press','congress','senate','government shutdown',
  'bank failure','financial crisis','recession','default',
  'earnings','quarterly results','revenue','eps',
  'merger','acquisition','ipo','bankruptcy',
  'government','proposal','infrastructure','pipelines','coal','energy',
  'larry fink','blackrock',
  'trump','president','prime minister','xi jinping','putin',
  'mortgage rate','foreclosures',
  'regime','regime change',
  'ships','shipping','supply chain',
  'artificial intelligence','cybersecurity','hack','exploit','zero day',
  'united states','united kingdom','europe','european union',
  'sterling','pound sterling','british pound','swiss franc','yen','euro',
  'terrorist','extremist',
]

function isJunk(headline) {
  const h = headline.toLowerCase()
  return JUNK_PHRASES.some(p => h.includes(p))
}

function isRelevant(article) {
  const text = (article.headline + ' ' + (article.summary || '')).toLowerCase()
  if (ALWAYS_PASS.some(k => text.includes(k))) return true
  const upper = text.toUpperCase()
  const tickers = upper.match(/\b[A-Z]{2,5}\b/g) || []
  return tickers.some(t => MEGA_CAP_TICKERS.has(t))
}

function categorize(text) {
  const t = text.toLowerCase()
  const earningsSignals = [
    'earnings beat','earnings miss','reported earnings','quarterly results',
    'q1 results','q2 results','q3 results','q4 results','full year results',
    'eps of','revenue of','profit rose','profit fell','sales rose','sales fell',
    'raised guidance','lowered guidance','beat estimates','missed estimates',
    'topped estimates','reported a loss','reported a profit',
  ]
  const geoSignals = [
    'war','airstrike','missile','nuclear','military','sanctions','embargo',
    'ceasefire','conflict','china','russia','ukraine','israel','iran','taiwan',
    'north korea','opec','middle east','g7','g20','nato','tariff','trade war',
    'federal reserve','fomc','powell','ecb','boj','boe','interest rate',
    'rate hike','rate cut','inflation','cpi','gdp','jobs report','nonfarm',
    'treasury','yield','dollar','currency','oil price','crude','energy',
    'election','white house','congress','senate','president','prime minister',
    'imf','world bank','bank failure','recession','default','debt ceiling',
  ]
  if (earningsSignals.some(k => t.includes(k))) return 'Earnings'
  if (geoSignals.some(k => t.includes(k))) return 'Geopolitical'
  return 'Markets'
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
    case 'Markets':      return { color: '#70c0ff', bg: '#001428', border: '#003080' }
    case 'Geopolitical': return { color: '#ffaa40', bg: '#1a0e00', border: '#604000' }
    case 'Earnings':     return { color: '#a070ff', bg: '#0e0018', border: '#400080' }
    default:             return { color: '#888',    bg: '#111',    border: '#333'    }
  }
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
      const res = await fetch('/api/news')
      const data = await res.json()

      const processed = (data.news || [])
        .filter(a => a.headline && !isJunk(a.headline))
        .filter(a => isRelevant(a))
        .map(a => ({
          ...a,
          category: categorize(a.headline + ' ' + (a.summary || '')),
        }))
        .filter(a => {
          if (a.category === 'Earnings') {
            return !EARNINGS_JUNK.some(p => a.headline.toLowerCase().includes(p))
          }
          return true
        })

      setArticles(processed)
      if (processed.length > 0 && !selected) selectArticle(processed[0])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  function selectArticle(article) {
  setSelected(article)
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
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>

          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 24, color: '#888', fontSize: 12, textAlign: 'center', letterSpacing: '0.05em' }}>
                NO STORIES IN THIS CATEGORY
              </div>
            )}
            {filtered.map(article => {
              const { color, bg, border } = categoryColor(article.category)
              const isSelected = selected?.id === article.id
              const isLive = Date.now() - new Date(article.created_at).getTime() < 300000
              return (
                <div key={article.id} onClick={() => selectArticle(article)} style={{
                  padding: '11px 14px',
                  borderBottom: '1px solid #161616',
                  cursor: 'pointer',
                  background: isSelected ? '#0d0d1a' : 'transparent',
                  borderLeft: isSelected ? '2px solid var(--blue)' : '2px solid transparent',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.06em', flexShrink: 0 }}>
                      {article.category.toUpperCase()}
                    </span>
                    {isLive && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: '#1a0000', color: '#ff4444', border: '1px solid #600000', letterSpacing: '0.06em', flexShrink: 0 }}>
                        LIVE
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.source?.toUpperCase()} · {timeAgo(article.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, lineHeight: 1.5, color: isSelected ? '#ffffff' : '#e8e8e8' }}>
                    {article.headline}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {selected ? (() => {
              const { color, bg, border } = categoryColor(selected.category)
              return (
                <>
                  <div style={{ padding: '16px 20px', flex: 1 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.45, marginBottom: 12, color: '#ffffff' }}>
                      {selected.headline}
                    </h2>
                    <div style={{ width: 32, height: 1, background: '#1e1e1e', marginBottom: 14 }} />
                    <p style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.85, marginBottom: 20 }}>
                      {selected.summary ? selected.summary.split('. ').slice(0, 3).join('. ') + '.' : 'No preview available.'}
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
                  </div>
                </>
              )
            })() : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 12, letterSpacing: '0.05em' }}>
                SELECT A STORY TO PREVIEW
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}