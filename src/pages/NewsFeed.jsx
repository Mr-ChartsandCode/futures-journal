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
  'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'dogecoin'
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
  const [category, setCategory] = useState('All')
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  async function fetchNews() {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()

      const processed = (data.news || [])

      setArticles(processed)
      if (processed.length > 0 && !selected) selectArticle(processed[0])
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

  
}