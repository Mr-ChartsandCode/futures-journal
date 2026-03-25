export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const symbol = req.query.symbol || 'PSX'
    const r = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,defaultKeyStatistics,financialData,summaryDetail`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
    )
    const data = await r.json()
    const result = data?.quoteSummary?.result?.[0]
    res.status(200).json({
      status: r.status,
      hasIncome: !!result?.incomeStatementHistory,
      hasBalance: !!result?.balanceSheetHistory,
      hasCashflow: !!result?.cashflowStatementHistory,
      hasKeyStats: !!result?.defaultKeyStatistics,
      hasFinancialData: !!result?.financialData,
      sampleIncome: result?.incomeStatementHistory?.incomeStatementHistory?.[0],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}