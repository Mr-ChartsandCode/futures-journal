const SECTORS = [
  { symbol: 'XLK',  name: 'Technology' },
  { symbol: 'XLE',  name: 'Energy' },
  { symbol: 'XLF',  name: 'Financials' },
  { symbol: 'XLV',  name: 'Healthcare' },
  { symbol: 'XLI',  name: 'Industrials' },
  { symbol: 'XLY',  name: 'Consumer Discr.' },
  { symbol: 'XLP',  name: 'Consumer Staples' },
  { symbol: 'XLB',  name: 'Materials' },
  { symbol: 'XLU',  name: 'Utilities' },
  { symbol: 'XLRE', name: 'Real Estate' },
  { symbol: 'XLC',  name: 'Comm. Services' },
  { symbol: 'XBI',  name: 'Biotech' },
]

const RANGES = {
  '1D':  '1d',
  '5D':  '5d',
  '1M':  '1mo',
  '3M':  '3mo',
  'YTD': 'ytd',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300')

  const range = req.query.range || '1D'
  const yahooRange = RANGES[range] || '1d'

  try {
    const results = await Promise.all(
      SECTORS.map(async sector => {
        try {
          const r = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${sector.symbol}?interval=1d&range=${yahooRange}`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
          )
          const data = await r.json()
          const result = data.chart?.result?.[0]
          const meta = result?.meta
          const closes = result?.indicators?.quote?.[0]?.close?.filter(Boolean) || []

          if (!meta) return { ...sector, change: null, price: null }

          const currentPrice = meta.regularMarketPrice
          let startPrice

          if (range === '1D') {
            startPrice = meta.chartPreviousClose
          } else {
            startPrice = closes[0] || meta.chartPreviousClose
          }

          const change = startPrice
            ? ((currentPrice - startPrice) / startPrice * 100)
            : null

          return {
            ...sector,
            price: currentPrice?.toFixed(2),
            change: change?.toFixed(2),
            startPrice: startPrice?.toFixed(2),
          }
        } catch {
          return { ...sector, change: null, price: null }
        }
      })
    )

    res.status(200).json({ sectors: results, range, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}