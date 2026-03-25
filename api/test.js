export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const ETFS = [
      { etf: 'XLK',  name: 'Technology',             url: 'https://www.ishares.com/us/products/239726/ishares-us-technology-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLF',  name: 'Financials',             url: 'https://www.ishares.com/us/products/239763/ishares-us-financials-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLV',  name: 'Healthcare',             url: 'https://www.ishares.com/us/products/239846/ishares-us-healthcare-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLE',  name: 'Energy',                 url: 'https://www.ishares.com/us/products/239771/ishares-us-energy-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLI',  name: 'Industrials',            url: 'https://www.ishares.com/us/products/239792/ishares-us-industrials-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLY',  name: 'Consumer Discretionary', url: 'https://www.ishares.com/us/products/239731/ishares-us-consumer-discretionary-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLP',  name: 'Consumer Staples',       url: 'https://www.ishares.com/us/products/239843/ishares-us-consumer-staples-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLB',  name: 'Materials',              url: 'https://www.ishares.com/us/products/239706/ishares-us-basic-materials-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLU',  name: 'Utilities',              url: 'https://www.ishares.com/us/products/239853/ishares-us-utilities-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLC',  name: 'Communication Services', url: 'https://www.ishares.com/us/products/239740/ishares-us-telecommunications-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XLRE', name: 'Real Estate',            url: 'https://www.ishares.com/us/products/239713/ishares-us-real-estate-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
      { etf: 'XBI',  name: 'Biotech',                url: 'https://www.ishares.com/us/products/239699/ishares-nasdaq-biotechnology-etf/1467271812596.ajax?fileType=csv&dataType=fund' },
    ]

    const results = await Promise.allSettled(
      ETFS.map(async ({ etf, name, url }) => {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
          signal: AbortSignal.timeout(8000),
        })
        const text = await r.text()
        const isCSV = text.includes('Ticker') || text.includes('ticker')
        return { etf, name, status: r.status, length: text.length, isCSV, preview: text.slice(0, 100) }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}