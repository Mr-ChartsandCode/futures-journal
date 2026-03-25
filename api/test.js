export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const sources = [
      { name: 'XLK SPDR', url: 'https://www.ssga.com/us/en/intermediary/etfs/funds/technology-select-sector-spdr-fund-xlk' },
      { name: 'XLK iShares CSV', url: 'https://www.ishares.com/us/products/239726/ishares-us-technology-etf/1467271812596.ajax?fileType=csv&fileName=IYW_holdings&dataType=fund' },
      { name: 'XLK ETF.com', url: 'https://etfdb.com/etf/XLK/#holdings' },
      { name: 'Slickcharts SP500', url: 'https://www.slickcharts.com/sp500' },
      { name: 'Slickcharts Nasdaq', url: 'https://www.slickcharts.com/nasdaq100' },
      { name: 'Wikipedia SP500', url: 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies' },
    ]

    const results = await Promise.allSettled(
      sources.map(async s => {
        const r = await fetch(s.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
          signal: AbortSignal.timeout(8000),
        })
        const text = await r.text()
        return { name: s.name, status: r.status, length: text.length, preview: text.slice(0, 150) }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}