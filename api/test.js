export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const ETFS = [
      { etf: 'XLK',  name: 'Technology',             url: 'https://www.sectorspdrs.com/api/fund/XLK/holdings.csv' },
      { etf: 'XLF',  name: 'Financials',             url: 'https://www.sectorspdrs.com/api/fund/XLF/holdings.csv' },
      { etf: 'XLV',  name: 'Healthcare',             url: 'https://www.sectorspdrs.com/api/fund/XLV/holdings.csv' },
      { etf: 'XLE',  name: 'Energy',                 url: 'https://www.sectorspdrs.com/api/fund/XLE/holdings.csv' },
      { etf: 'XLI',  name: 'Industrials',            url: 'https://www.sectorspdrs.com/api/fund/XLI/holdings.csv' },
      { etf: 'XLY',  name: 'Consumer Discretionary', url: 'https://www.sectorspdrs.com/api/fund/XLY/holdings.csv' },
      { etf: 'XLP',  name: 'Consumer Staples',       url: 'https://www.sectorspdrs.com/api/fund/XLP/holdings.csv' },
      { etf: 'XLB',  name: 'Materials',              url: 'https://www.sectorspdrs.com/api/fund/XLB/holdings.csv' },
      { etf: 'XLU',  name: 'Utilities',              url: 'https://www.sectorspdrs.com/api/fund/XLU/holdings.csv' },
      { etf: 'XLC',  name: 'Communication Services', url: 'https://www.sectorspdrs.com/api/fund/XLC/holdings.csv' },
      { etf: 'XLRE', name: 'Real Estate',            url: 'https://www.sectorspdrs.com/api/fund/XLRE/holdings.csv' },
      { etf: 'XBI',  name: 'Biotech',                url: 'https://www.ssga.com/us/en/intermediary/etfs/funds/spdr-sp-biotech-etf-xbi/IQ3X5Z.csv' },
    ]

    const results = await Promise.allSettled(
      ETFS.map(async ({ etf, name, url }) => {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
          signal: AbortSignal.timeout(8000),
        })
        const text = await r.text()
        const isCSV = text.includes('Ticker') || text.includes('Symbol') || text.includes('ticker')
        return { etf, name, status: r.status, length: text.length, isCSV, preview: text.slice(0, 150) }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}