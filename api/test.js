export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const symbol = req.query.symbol || 'AAPL'
    const key = process.env.FMP_API_KEY

    const endpoints = [
      `https://financialmodelingprep.com/stable/earnings?symbol=${symbol}&apikey=${key}&limit=8`,
      `https://financialmodelingprep.com/stable/earnings-confirmed?symbol=${symbol}&apikey=${key}`,
      `https://financialmodelingprep.com/stable/price-target-consensus?symbol=${symbol}&apikey=${key}`,
      `https://financialmodelingprep.com/stable/price-target?symbol=${symbol}&apikey=${key}&limit=5`,
      `https://financialmodelingprep.com/stable/analyst-estimates?symbol=${symbol}&apikey=${key}&limit=4`,
      `https://financialmodelingprep.com/stable/historical-price?symbol=${symbol}&apikey=${key}&from=2024-01-01`,
    ]

    const results = await Promise.allSettled(
      endpoints.map(async url => {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        const text = await r.text()
        let data
        try { data = JSON.parse(text) } catch { data = text.slice(0, 100) }
        const endpoint = url.split('/stable/')[1].split('?')[0]
        return {
          endpoint,
          status: r.status,
          hasData: Array.isArray(data) ? data.length > 0 : !!data,
          sample: Array.isArray(data) ? data[0] : data
        }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}