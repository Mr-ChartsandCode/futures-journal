const MIN_MARKET_CAP = 10_000_000_000 // $10B minimum

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=120')

  try {
    const [gainersRes, losersRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=day_gainers&count=100', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
      }),
      fetch('https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=day_losers&count=100', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
      })
    ])

    const [gainersData, losersData] = await Promise.all([
      gainersRes.json(),
      losersRes.json()
    ])

    const mapQuote = q => ({
      symbol: q.symbol,
      name: q.shortName || q.displayName || q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      dayHigh: q.regularMarketDayHigh,
      dayLow: q.regularMarketDayLow,
      prevClose: q.regularMarketPreviousClose,
    })

    const gainers = (gainersData?.finance?.result?.[0]?.quotes || [])
      .filter(q => q.marketCap >= MIN_MARKET_CAP)
      .map(mapQuote)

    const losers = (losersData?.finance?.result?.[0]?.quotes || [])
      .filter(q => q.marketCap >= MIN_MARKET_CAP)
      .map(mapQuote)

    res.status(200).json({ gainers, losers, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}