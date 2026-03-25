const TRACKED_TICKERS = [
  'MSFT','AAPL','NVDA','AVGO','ORCL','CRM','ACN','IBM','CSCO','ADBE',
  'QCOM','TXN','AMD','INTU','AMAT','PANW','KLAC','LRCX','MU','INTC',
  'SNPS','CDNS','FTNT','ADSK','GOOGL','GOOG','META','NFLX','DIS','CMCSA',
  'VZ','T','TMUS','CHTR','EA','TTWO','LYV','AMZN','TSLA','HD','MCD',
  'LOW','SBUX','NKE','BKNG','TJX','ABNB','CMG','GM','F','ORLY','AZO',
  'MAR','HLT','RCL','WMT','COST','PG','KO','PEP','PM','MO','MDLZ',
  'CL','GIS','KHC','STZ','BRK.B','JPM','V','MA','BAC','WFC','GS',
  'AXP','MS','SPGI','BLK','C','CB','PGR','MMC','AON','ICE','CME',
  'USB','PNC','COF','MCO','SCHW','LLY','UNH','JNJ','ABBV','MRK','TMO',
  'ABT','ISRG','DHR','SYK','BSX','AMGN','GILD','MDT','BMY','PFE',
  'REGN','ZTS','CI','ELV','CVS','XOM','CVX','COP','EOG','SLB','MPC',
  'PSX','VLO','OXY','DVN','HAL','BKR','KMI','WMB','OKE','GE','RTX',
  'CAT','HON','UPS','DE','LMT','BA','UNP','FDX','MMM','GD','NOC',
  'EMR','ETN','ITW','CSX','NSC','PH','CARR','CTAS','LIN','APD','SHW',
  'ECL','FCX','NEM','NUE','DOW','DD','PPG','NEE','SO','DUK','SRE',
  'AEP','EXC','CEG','VST','PLD','AMT','EQIX','WELL','SPG','DLR','PSA',
  'O','VRTX','BIIB','MRNA','ILMN','ALNY',
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=90')

  const alerts = []
  const now = new Date().toISOString()

  try {
    // Check big movers — batch into groups of 20 to avoid URL length limits
    const BATCH_SIZE = 20
    const batches = []
    for (let i = 0; i < TRACKED_TICKERS.length; i += BATCH_SIZE) {
      batches.push(TRACKED_TICKERS.slice(i, i + BATCH_SIZE))
    }

    const batchResults = await Promise.allSettled(
      batches.map(async batch => {
        const symbols = batch.join(',')
        const r = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=symbol,shortName,regularMarketChangePercent,regularMarketPrice,regularMarketChange`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
        )
        const data = await r.json()
        return data?.quoteResponse?.result || []
      })
    )

    const allQuotes = batchResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)

    for (const quote of allQuotes) {
      const pct = quote.regularMarketChangePercent
      if (Math.abs(pct) >= 3) {
        const dir = pct >= 0 ? 'up' : 'down'
        const sign = pct >= 0 ? '+' : ''
        alerts.push({
          id: `alert-mover-${quote.symbol}-${Date.now()}`,
          headline: `${quote.symbol} ${sign}${pct.toFixed(2)}% — ${quote.shortName || quote.symbol} moving significantly today`,
          summary: `${quote.shortName || quote.symbol} is ${dir} ${Math.abs(pct).toFixed(2)}% to $${quote.regularMarketPrice?.toFixed(2)}. This is a significant single-day move of ${sign}$${quote.regularMarketChange?.toFixed(2)} per share.`,
          source: 'TERMINAL ALERT',
          category: 'Alert',
          created_at: now,
          isAlert: true,
          alertType: 'mover',
          changePct: pct,
        })
      }
    }

    // Sort movers by magnitude
    alerts.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))

    res.status(200).json({ alerts, count: alerts.length })
  } catch (err) {
    console.error('Alerts error:', err)
    res.status(200).json({ alerts: [], count: 0, error: err.message })
  }
}