export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const ETFS = [
      { etf: 'XLK',  url: 'https://www.ssga.com/us/en/intermediary/etfs/funds/technology-select-sector-spdr-fund-xlk/IXUS.csv' },
      { etf: 'XLK2', url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xlk.xlsx' },
      { etf: 'XLK3', url: 'https://www.ssga.com/us/en/intermediary/etfs/funds/technology-select-sector-spdr-fund-xlk' },
      { etf: 'XLF',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xlf.xlsx' },
      { etf: 'XLV',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xlv.xlsx' },
      { etf: 'XLE',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xle.xlsx' },
      { etf: 'XLI',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xli.xlsx' },
      { etf: 'XLY',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xly.xlsx' },
      { etf: 'XLP',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xlp.xlsx' },
      { etf: 'XLB',  url: 'https://www.ssga.com/library-content/products/fund-data/etfs/us/holdings-daily-us-en-xlb.xlsx' },
    ]

    const results = await Promise.allSettled(
      ETFS.map(async ({ etf, url }) => {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.ssga.com/',
          },
          signal: AbortSignal.timeout(8000),
        })
        const text = await r.text()
        return { etf, url: url.split('/').pop(), status: r.status, length: text.length, preview: text.slice(0, 100) }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}