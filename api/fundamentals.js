export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const symbol = req.query.symbol?.toUpperCase()
  if (!symbol) return res.status(400).json({ error: 'Symbol required' })

  const key = process.env.FMP_API_KEY

  try {
    const [
      profileRes, ratiosRes, incomeRes, balanceRes, cashflowRes,
      earningsRes, priceTargetRes, priceTargetSummaryRes,
      analystRes, priceHistoryRes
    ] = await Promise.allSettled([
      fetch(`https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/ratios-ttm?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/income-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${symbol}&apikey=${key}&limit=5`),
      fetch(`https://financialmodelingprep.com/stable/earnings?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/price-target-consensus?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/price-target-summary?symbol=${symbol}&apikey=${key}`),
      fetch(`https://financialmodelingprep.com/stable/analyst-estimates?symbol=${symbol}&period=annual&apikey=${key}&limit=3`),
      fetch(`https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${key}&from=2010-01-01&to=${new Date().toISOString().split('T')[0]}`),
    ])

    const parse = async (r) => {
      if (r.status !== 'fulfilled') return null
      try { return await r.value.json() } catch { return null }
    }

    const [
      profile, ratios, income, balance, cashflow,
      earnings, priceTarget, priceTargetSummary,
      analyst, priceHistory
    ] = await Promise.all([
      parse(profileRes), parse(ratiosRes), parse(incomeRes),
      parse(balanceRes), parse(cashflowRes), parse(earningsRes),
      parse(priceTargetRes), parse(priceTargetSummaryRes),
      parse(analystRes), parse(priceHistoryRes),
    ])

    const prices = Array.isArray(priceHistory) ? priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date)) : []
    const currentPrice = prices[0]?.price || profile?.[0]?.price

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

    // Fallback: compute ratios from raw statements if TTM ratios empty
let computedRatios = ratios?.[0] || null
if (!computedRatios && income?.[0] && balance?.[0]) {
  const i = income[0]
  const b = balance[0]
  const cf = cashflow?.[0]
  const price = profile?.[0]?.price
  const shares = i.weightedAverageShsOutDil || i.weightedAverageShsOut
  const eps = shares ? i.netIncome / shares : null
  computedRatios = {
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

res.status(200).json({
  profile: profile?.[0] || null,
  ratios: computedRatios,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}