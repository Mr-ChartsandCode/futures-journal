// Parses AMP/Dorman-style daily statement PDFs
export function parseDailyStatement(text) {
  const trades = []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Extract date from header
  let statementDate = null
  const dateMatch = text.match(/(\d{2}-[A-Z]{3}-\d{2,4})/)
  if (dateMatch) {
    const raw = dateMatch[1] // e.g. 18-MAR-26
    const [day, mon, yr] = raw.split('-')
    const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' }
    const year = yr.length === 2 ? `20${yr}` : yr
    statementDate = `${year}-${months[mon]}-${day.padStart(2,'0')}`
  }

  // Find trade confirmation lines
  // Format: DATE NUMBER MARKET BUY SELL CONTRACT DESCRIPTION TRADE_PRICE CCY
  const tradeLineRe = /(\d{2}-[A-Z]{3}-\d{2,4})\s+(\d+)\s+CME\s+(\d*)\s+(\d*)\s+(.*?(?:Future|Futures).*?)\s+([\d.]+)\s+USD/g
  const rawTrades = []
  let m
  while ((m = tradeLineRe.exec(text)) !== null) {
    const buy = parseInt(m[3]) || 0
    const sell = parseInt(m[4]) || 0
    const desc = m[5].trim()
    const price = parseFloat(m[6])
    
    // Extract instrument from description e.g. "MES Future JUN 26" -> MES
    const instrMatch = desc.match(/^(M?ES|M?NQ|M?CL|M?GC|M?SI|M?NG|MYM|M2K)\b/i)
    const instrument = instrMatch ? instrMatch[1].toUpperCase() : desc.split(' ')[0].toUpperCase()

    rawTrades.push({ buy, sell, price, instrument, date: statementDate })
  }

  if (!rawTrades.length) return { trades: [], error: 'No trades found in PDF' }

  // Extract P&L from P&S section
  const pnlMatch = text.match(/P&S\s+USD\s+([\d.]+)\s+(DR|CR)/)
  let totalPnl = null
  if (pnlMatch) {
    totalPnl = parseFloat(pnlMatch[1]) * (pnlMatch[2] === 'CR' ? 1 : -1)
  }

  // Extract fees
  // Try multiple fee patterns
    const feesMatch = text.match(/TOTAL COMMISSION & FEES\s+([\d.]+)\s+DR/) ||
        text.match(/TOTAL COMMISSION[^$\d]*([\d.]+)\s+DR/) ||
        text.match(/COMMISSION\s+USD\s+([\d.]+)\s+DR/)

    // Also sum up individual fee lines as fallback
    const exchangeMatch = text.match(/Exchange\s+USD\s+([\d.]+)\s+DR/i)
    const nfaMatch = text.match(/NFA\s+USD\s+([\d.]+)\s+DR/i)
    const clearingMatch = text.match(/Clearing[^\d]*([\d.]+)\s+DR/i)
    const commMatch = text.match(/Commission\s+USD\s+([\d.]+)\s+DR/i)

    const summedFees = [exchangeMatch, nfaMatch, clearingMatch, commMatch]
    .filter(Boolean)
    .reduce((s, m) => s + parseFloat(m[1]), 0)

    const totalFees = feesMatch
    ? parseFloat(feesMatch[1])
    : summedFees > 0 ? summedFees : 0

  // Extract avg long / avg short
  const avgLongMatch = text.match(/AVERAGE LONG\s+([\d.]+)/)
  const avgShortMatch = text.match(/AVERAGE SHORT\s+([\d.]+)/)
  const avgLong = avgLongMatch ? parseFloat(avgLongMatch[1]) : null
  const avgShort = avgShortMatch ? parseFloat(avgShortMatch[1]) : null

  // Get instrument and quantities from raw trades
  const buys = rawTrades.filter(t => t.buy > 0)
  const sells = rawTrades.filter(t => t.sell > 0)
  const instrument = rawTrades[0]?.instrument || 'MES'
  const totalContracts = Math.max(
    rawTrades.reduce((s, t) => s + t.buy, 0),
    rawTrades.reduce((s, t) => s + t.sell, 0)
  )

  // Determine direction — if avg long > avg short then we went long and sold higher? 
  // Actually check which came first by order number isn't available, use price logic
  // If sold at higher price = long trade, if bought at higher price = short trade
  const direction = avgLong && avgShort
    ? (avgShort > avgLong ? 'long' : 'short')
    : 'long'

  const entryPrice = direction === 'long' ? avgLong : avgShort
  const exitPrice = direction === 'long' ? avgShort : avgLong

  // MES point value = $5, MES tick = 0.25 = $1.25
  // ES point value = $50
  const pointValue = instrument.startsWith('M') ? 5 : 50

  const grossPnl = entryPrice && exitPrice
    ? (direction === 'long'
      ? (exitPrice - entryPrice) * pointValue * totalContracts
      : (entryPrice - exitPrice) * pointValue * totalContracts)
    : totalPnl

  const netPnl = totalPnl !== null ? -Math.abs(totalPnl) * Math.sign(totalPnl === grossPnl ? 1 : -1) : grossPnl - totalFees

  // Build single consolidated trade entry
  trades.push({
    trade_date: statementDate,
    instrument,
    direction,
    contracts: totalContracts,
    entry_price: entryPrice,
    exit_price: exitPrice,
    pnl: totalPnl !== null ? (pnlMatch[2] === 'CR' ? Math.abs(totalPnl) : -Math.abs(totalPnl)) : grossPnl,
    fees: totalFees,
    notes: `Imported from daily statement. ${totalContracts} contract${totalContracts > 1 ? 's' : ''}. Entry avg: ${entryPrice}, Exit avg: ${exitPrice}.`,
  })

  return { trades, rawCount: rawTrades.length, fees: totalFees }
}