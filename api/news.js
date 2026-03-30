const FEEDS = [
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', label: 'CNBC Markets' },
  { url: 'https://rss.politico.com/energy.xml', label: 'Politico Energy' },
  { url: 'https://rss.politico.com/defense.xml', label: 'Politico Defense'},
  { url: 'https://rss.politico.com/congress.xml', label: ' Politico Congress'},
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', label: 'Al Jazeera' },
  { url: 'https://www.notus.org/index.rss', label: 'NOTUS' },
  { url: 'https://news.google.com/rss/search?q=commodities+oil+gas+coal+copper+gold+LNG+OPEC+supply+disruption+pipeline+when:1d&hl=en-US&gl=US&ceid=US:en', label: 'Commodities' },
  { url: 'https://news.google.com/rss/search?q=site:reuters.com+world+economy+markets+trade&hl=en-US&gl=US&ceid=US:en', label: 'Reuters International' },
  { url: 'https://news.google.com/rss/search?q=site:apnews.com+business+economy+markets&hl=en-US&gl=US&ceid=US:en', label: 'AP Business' },
]


const JUNK_PHRASES = [
  'invested in', 'years ago would', 'would be worth', 'if you invested',
  'should you buy', 'should i buy', 'why i am buying',
  'top 10', 'top 5', 'top 3', 'best stocks', 'best etf', 'best funds',
  'stocks to buy', 'stocks to watch', 'must buy', 'you should own',
  'here is why', "here's why", 'reasons to buy', 'reasons to sell',
  'millionaire', 'retire early', 'get rich', 'passive income',
  'dividend kings', 'dividend aristocrat',
  'how to invest', 'how to trade', 'for beginners', 'explainer',
  'what you need to know', 'everything you need',
  'better buy', 'which is better', 'vs.', ' vs ',
  'morning brief', 'afternoon brief', 'daily recap', 'week ahead',
  'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'dogecoin', 'altcoin',
  'benzinga', 'motley fool', 'seeking alpha',
  'quiz', 'crossword', 'podcast', 'listen now', 'watch now',
  'photos', 'video:', 'gallery', ' democrats', 'republicans', 'pope', 'god', 'players', 'games',
  'transgender', 'athletes', 'prayers', 'score', 'fan', 'stadium', 'world cup', 'playoff',
]

const EARNINGS_JUNK = [
  'preview', 'what to expect', 'ahead of earnings',
  'before earnings', 'earnings playbook', 'how to trade earnings',
  'earnings options', 'earnings play',
]

const AJ_REQUIRED = [
  'explosion','exploded','strike','airstrike','air strike','missile','attack',
  'blast','bombed','bombing','killed','dead','troops','military','forces',
  'pipeline','oil field','tanker','port','blockade','naval','warship',
  'isis','isil','daesh','houthi','hezbollah','hamas military','rocket fire',
  'war','combat','frontline','offensive','invasion','seized','captured',
  'power plant','infrastructure attack','refinery attack','drone strike',
  'weapon','ammunition','artillery','mortar','raid',
]

const AJ_JUNK = [
  'law passed','legislation','court','ruling','verdict','sentenced',
  'protest','demonstration','march','rally','activist',
  'election','vote','poll','political','parliament','minister',
  'rights','discrimination','apartheid','settlement','occupied',
  'cultural','heritage','museum','art','film','music',
  'aid','humanitarian','refugee','asylum','migrant',
  'speech','statement','comments','says','urges','calls for',
  'condemned','criticized','accused','blamed',
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
  'election','white house','congress','senate','government shutdown',
  'bank failure','financial crisis','recession','default',
  'earnings','quarterly results','revenue','eps',
  'merger','acquisition','ipo','bankruptcy',
  'government','infrastructure','pipelines','coal','energy',
  'larry fink','blackrock','trump','president','prime minister',
  'xi jinping','putin','mortgage rate','supply chain',
  'artificial intelligence','cybersecurity',
  'united states','united kingdom','europe','european union',
  'sterling','pound','swiss franc','yen','euro',
  'terrorist','extremist','regime', 'federal budget','debt ceiling','continuing resolution','fiscal policy',
  'treasury secretary','fed chair','federal chairman','jerome powell',
  'scott bessent','janet yellen',
  'press secretary','press briefing','white house briefing',
  'executive order','signed into law','passed the senate','passed the house',
  'senate vote','house vote','filibuster','budget reconciliation',
  'trade representative','commerce secretary','treasury department',
  'department of energy','department of defense','pentagon',
  'new bill','new legislation','new law','new regulation','new policy',
  'deregulation','regulatory rollback','regulatory change',
  'epa','sec ruling','sec enforcement','doj','department of justice',
  'antitrust','monopoly','price fixing',
  'national security','defense spending','military budget',
  'strategic petroleum reserve','spr release','spr refill',
  'sovereign wealth fund','national debt','deficit spending',
  'tax cut','tax hike','tax reform','corporate tax',
  'minimum wage','labor market','unemployment rate',
  'immigration policy','border policy',
  'marco rubio','scott bessent','howard lutnick','doug burgum',
  'added to the s&p','s&p 500 addition','s&p 500 removal','removed from the s&p','joins the s&p',
  'added to s&p 500','dropped from s&p','index rebalance','index reconstitution','index addition',
  'index removal','nasdaq 100 addition','nasdaq 100 removal','dow jones addition','dow jones removal','replaces',
  'added to the dow','removed from the dow','index change','index membership','constituent change','etf rebalance',
  's&p reshuffle','russell rebalance','index inclusion','index exclusion',
  // Key speakers
  'jerome powell', 'powell speaks', 'powell speech', 'fed chair powell',
  'scott bessent', 'bessent speaks', 'bessent speech',
  'donald trump', 'trump speaks', 'trump press',
  'fed governor', 'fed president speaks', 'fomc member speaks',
  'press conference', 'live now', 'speaking now', 'remarks',
  // international
  'bank of england','bank of japan','boj rate','boe rate','ecb rate',
  'pboc','peoples bank of china','reserve bank of australia','rba',
  'bank of canada','boc rate','bundesbank',
  'g20','g7','imf forecast','world bank forecast','oecd',
  'german gdp','uk gdp','japan gdp','china gdp','india gdp',
  'uk inflation','eu inflation','japan inflation','china inflation',
  'yuan','renminbi','yen','pound sterling','aussie dollar','canadian dollar',
  'emerging markets','developing economies','global trade',
  'export data','import data','trade balance','current account',
  'sovereign debt','debt crisis','currency crisis','capital flight',
  'rate decision','central bank decision','monetary policy',
  // wartime
  'explosion','exploded','airstrike','air strike','missile strike',
  'pipeline explosion','oil field','tanker attacked','port blockade',
  'houthi','drone strike','refinery','naval blockade','warship',
  'isis attack','isil','daesh attack','combat','frontline',
  'lng supply','gas supply','coal supply','commodity supply',
  'biotech deal','drug development deal','billion deal','signs deal',
  'production starts','starts production','begins production',
  'supply disruption','supply chain shock','energy supply',
]

function isJunk(headline) {
  const h = headline.toLowerCase()
  return JUNK_PHRASES.some(p => h.includes(p))
}

function isRelevant(headline, summary) {
  const text = (headline + ' ' + (summary || '')).toLowerCase()
  if (ALWAYS_PASS.some(k => text.includes(k))) return true
  const upper = text.toUpperCase()
  const tickers = upper.match(/\b[A-Z]{2,5}\b/g) || []
  return tickers.some(t => MEGA_CAP_TICKERS.has(t))
}

function isEarningsJunk(headline) {
  const h = headline.toLowerCase()
  return EARNINGS_JUNK.some(p => h.includes(p))
}

function categorize(text) {
  const t = text.toLowerCase()
  // Al Jazeera shocks are always Geopolitical
  if (t.includes('explosion') || t.includes('airstrike') || t.includes('missile') ||
      t.includes('houthi') || t.includes('isis') || t.includes('blast') ||
      t.includes('pipeline') && (t.includes('attack') || t.includes('explod')))
    return 'Geopolitical'
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=90')

  const results = await Promise.allSettled(
    FEEDS.map(async feed => {
      try {
        const r = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(8000),
        })
        if (!r.ok) return []
        const xml = await r.text()
        const items = []
        const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
        for (const match of itemMatches) {
          const block = match[1]
          const get = (tag) => {
            const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
            return m ? (m[1] || m[2] || '').trim() : ''
          }
          const title = get('title')
          const description = get('description')
          const link = block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1]?.trim() || get('link')
          const pubDate = get('pubDate')
          const guid = get('guid') || link
          const cleanDesc = description.replace(/<[^>]+>/g, '').trim()

          if (!title) continue
          if (isJunk(title)) continue
          // Al Jazeera — only military/infrastructure shocks
          if (feed.label === 'Al Jazeera') {
            const text = (title + ' ' + cleanDesc).toLowerCase()
            const hasShock = AJ_REQUIRED.some(k => text.includes(k))
            const hasJunk = AJ_JUNK.some(k => text.includes(k))
            if (!hasShock || hasJunk) continue
          }

          if (!isRelevant(title, cleanDesc)) continue

          const cat = categorize(title + ' ' + cleanDesc)
          if (cat === 'Earnings' && isEarningsJunk(title)) continue

          items.push({
            id: guid,
            headline: title,
            summary: cleanDesc,
            source: feed.label,
            url: link?.trim(),
            created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            category: cat,
          })
        }
        return items
      } catch (err) {
        console.log(`${feed.label} failed:`, err.message)
        return []
      }
    })
  )

  const allItems = []
  for (const result of results) {
    if (result.status === 'fulfilled') allItems.push(...result.value)
  }

  const ytdStart = new Date(new Date().getFullYear(), 0, 1).getTime()

  const seen = new Set()
  const deduped = allItems.filter(a => {
    if (!a.headline || seen.has(a.headline)) return false
    if (new Date(a.created_at).getTime() < ytdStart) return false
    seen.add(a.headline)
    return true
  })

  deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  res.status(200).json({ news: deduped, count: deduped.length })
}