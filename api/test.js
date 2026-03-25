export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const sectors = [
      { symbol: 'XLK', name: 'Technology' },
      { symbol: 'XLE', name: 'Energy' },
    ]

    const results = await Promise.all(
      sectors.map(async s => {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${s.symbol}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const data = await r.json()
        const meta = data.chart?.result?.[0]?.meta
        return {
          symbol: s.symbol,
          name: s.name,
          status: r.status,
          price: meta?.regularMarketPrice,
          prevClose: meta?.chartPreviousClose,
          change: meta ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2) : null
        }
      })
    )

    res.status(200).json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}