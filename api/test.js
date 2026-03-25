export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const etf = req.query.etf || 'XLK'
    const r = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${etf}?modules=topHoldings`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
    )
    const data = await r.json()
    const holdings = data?.quoteSummary?.result?.[0]?.topHoldings?.holdings
    res.status(200).json({ status: r.status, count: holdings?.length, holdings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
