export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const symbol = req.query.symbol?.toUpperCase()
  if (!symbol) return res.status(400).json({ error: 'Symbol required' })

  const key = process.env.FMP_API_KEY
  const today = new Date().toISOString().split('T')[0]

  try {
    const [
      profileRes, ratiosRes, incomeRes, balanceRes, cashflowRes,
      earningsRes, priceTargetRes, priceTargetSummaryRes,
      analystRes, priceHistoryRes
    ] = await Promise.all([
      fetch(`https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/ratios-ttm?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/earnings?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/price-target-consensus?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/price-target-summary?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/analyst-estimates?symbol=${symbol}&period=annual&apikey=${key}&limit=3`),
      fetch(`https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${key}&from=2010-01-01&to=${today}`),
    ])

    const safeJson = async (r) => {
      try {
        const text = await r.text()
        const data = JSON.parse(text)
        if (typeof data === 'string') return null
        return data
      } catch { return null }
    }

    const [
      profileData, ratiosData, incomeData, balanceData, cashflowData,
      earningsData, priceTargetData, priceTargetSummaryData,
      analystData, priceHistoryData
    ] = await Promise.all([
      safeJson(profileRes), safeJson(ratiosRes), safeJson(incomeRes),
      safeJson(balanceRes), safeJson(cashflowRes), safeJson(earningsRes),
      safeJson(priceTargetRes), safeJson(priceTargetSummaryRes),
      safeJson(analystRes), safeJson(priceHistoryRes),
    ])

    const profile = Array.isArray(profileData) ? profileData[0] : null
    const income = Array.isArray(incomeData) ? incomeData : []
    const balance = Array.isArray(balanceData) ? balanceData : []
    const cashflow = Array.isArray(cashflowData) ? cashflowData : []
    const earnings = Array.isArray(earningsData) ? earningsData : []
    const analyst = Array.isArray(analystData) ? analystData : []
    const priceTargetSummary = Array.isArray(priceTargetSummaryData) ? priceTargetSummaryData[0] : null

    let ratios = Array.isArray(ratiosData) ? ratiosData[0] : null
    if (!ratios && income[0] && balance[0]) {
      const i = income[0]
      const b = balance[0]
      const cf = cashflow[0]
      const price = profile?.price
      const shares = i.weightedAverageShsOutDil || i.weightedAverageShsOut
      const eps = shares ? i.netIncome / shares : null
      ratios = {
        priceToEarningsRatioTTM: eps && price ? price / eps : null,
        priceToBookRatioTTM: b.totalEquity && shares && price ? price / (b.totalEquity / shares) : null,
        priceToFreeCashFlowRatioTTM: cf?.freeCashFlow && shares && price ? price / (cf.freeCashFlow / shares) : null,
        priceToSalesRatioTTM: i.revenue && shares && price ? price / (i.revenue / shares) : null,
        grossProfitMarginTTM: i.revenue ? i.grossProfit / i.revenue : null,
        netProfitMarginTTM: i.revenue ? i.netIncome / i.revenue : null,
        debtToEquityRatioTTM: b.totalEquity ? b.totalDebt / b.totalEquity : null,
        currentRatioTTM: b.totalCurrentLiabilities ? b.totalCurrentAssets / b.totalCurrentLiabilities : null,
        freeCashFlowOperatingCashFlowRatioTTM: cf?.operatingCashFlow ? cf.freeCashFlow / cf.operatingCashFlow : null,
      }
    }

    const prices = Array.isArray(priceHistoryData)
      ? priceHistoryData.sort((a, b) => new Date(b.date) - new Date(a.date))
      : []
    const currentPrice = profile?.price || prices[0]?.price

    function getPriceChange(daysAgo) {
      if (!currentPrice || prices.length === 0) return null
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - daysAgo)
      const closest = prices.find(p => new Date(p.date) <= targetDate)
      if (!closest) return null
      return ((currentPrice - closest.price) / closest.price * 100).toFixed(2)
    }

    const priceChanges = {
      '1M':  getPriceChange(30),
      '3M':  getPriceChange(90),
      '6M':  getPriceChange(180),
      '1Y':  getPriceChange(365),
      '5Y':  getPriceChange(1825),
      '10Y': getPriceChange(3650),
    }

    res.status(200).json({
      profile,
      ratios,
      income,
      balance,
      cashflow,
      earnings,
      priceTarget: priceTargetData || null,
      priceTargetSummary,
      analyst,
      priceChanges,
      currentPrice,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}