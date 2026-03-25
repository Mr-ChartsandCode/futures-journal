export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const r = await fetch(
      'https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds=day_gainers&count=100',
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
    )
    const data = await r.json()
    const quotes = data?.finance?.result?.[0]?.quotes || []
    res.status(200).json({ count: quotes.length, sample: quotes.slice(0, 3).map(q => ({ symbol: q.symbol, name: q.shortName, cap: q.marketCap })) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}