export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const symbol = req.query.symbol || 'PSX'
    const endpoints = [
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,financialData,defaultKeyStatistics`,
      `https://query1.finance.yahoo.com/v11/finance/quoteSummary/${symbol}?modules=incomeStatementHistory%2CbalanceSheetHistory%2CcashflowStatementHistory%2CfinancialData%2CdefaultKeyStatistics`,
      `https://query2.finance.yahoo.com/v11/finance/quoteSummary/${symbol}?modules=financialData`,
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
    ]

    const results = await Promise.allSettled(
      endpoints.map(async url => {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://finance.yahoo.com',
          },
          signal: AbortSignal.timeout(8000),
        })
        const text = await r.text()
        let data
        try { data = JSON.parse(text) } catch { data = null }
        return { url: url.split('/finance/')[1].split('?')[0], status: r.status, hasData: !!data?.quoteSummary?.result?.[0] || !!data?.chart?.result?.[0], preview: text.slice(0, 100) }
      })
    )

    res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}