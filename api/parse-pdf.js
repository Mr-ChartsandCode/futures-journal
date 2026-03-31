export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from('--' + boundary)
  let start = 0
  const parts = []
  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuf, start)
    if (boundaryIdx === -1) break
    const headerStart = boundaryIdx + boundaryBuf.length + 2
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart)
    if (headerEnd === -1) break
    const dataStart = headerEnd + 4
    const nextBoundary = buffer.indexOf(boundaryBuf, dataStart)
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2
    const headers = buffer.slice(headerStart, headerEnd).toString()
    const data = buffer.slice(dataStart, dataEnd)
    parts.push({ headers, data })
    start = nextBoundary === -1 ? buffer.length : nextBoundary
  }
  return parts
}

function parseDailyStatement(text) {
  let statementDate = null
  const dateMatch = text.match(/(\d{2}-[A-Z]{3}-\d{2,4})/)
  if (dateMatch) {
    const [day, mon, yr] = dateMatch[1].split('-')
    const months = { JAN:'01',FEB:'02',MAR:'03',APR:'04',MAY:'05',JUN:'06',JUL:'07',AUG:'08',SEP:'09',OCT:'10',NOV:'11',DEC:'12' }
    const year = yr.length === 2 ? `20${yr}` : yr
    statementDate = `${year}-${months[mon]}-${day.padStart(2,'0')}`
  }
  if (!statementDate) return { trades: [], error: 'Could not find date in PDF' }

  const avgLongMatch = text.match(/AVERAGE LONG\s+([\d.]+)/)
  const avgShortMatch = text.match(/AVERAGE SHORT\s+([\d.]+)/)
  const avgLong = avgLongMatch ? parseFloat(avgLongMatch[1]) : null
  const avgShort = avgShortMatch ? parseFloat(avgShortMatch[1]) : null

  const pnlMatch = text.match(/P&S\s+USD\s+([\d.]+)\s+(DR|CR)/)
  const totalPnl = pnlMatch
    ? (pnlMatch[2] === 'DR' ? -parseFloat(pnlMatch[1]) : parseFloat(pnlMatch[1]))
    : null
  if (totalPnl === null) return { trades: [], error: 'Could not find P&L in PDF' }

  const exchangeMatch = text.match(/Exchange\s+USD\s+([\d.]+)/i)
  const nfaMatch = text.match(/NFA\s+USD\s+([\d.]+)/i)
  const clearingMatch = text.match(/Clearing[^\d]*([\d.]+)/i)
  const commMatch = text.match(/Commission\s+USD\s+([\d.]+)/i)
  const totalFees = [exchangeMatch, nfaMatch, clearingMatch, commMatch]
    .filter(Boolean)
    .reduce((s, m) => s + parseFloat(m[1]), 0)

  const totalMatch = text.match(/TOTAL\s+(\d+)\s+(\d+)/)
  const totalContracts = totalMatch ? parseInt(totalMatch[1]) : 1

  const instrMatch = text.match(/\b(MES|MNQ|MCL|MGC|ES|NQ|CL|GC|MYM|M2K)\b/)
  const instrument = instrMatch ? instrMatch[1] : 'MES'

  let direction = 'long'
  if (avgLong && avgShort) {
    const pointValue = instrument.startsWith('M') ? 5 : 50
    const longPnl = (avgShort - avgLong) * totalContracts * pointValue
    const shortPnl = (avgLong - avgShort) * totalContracts * pointValue
    direction = Math.abs(longPnl - totalPnl) < Math.abs(shortPnl - totalPnl) ? 'long' : 'short'
  }

  const entryPrice = direction === 'short' ? avgShort : avgLong
  const exitPrice = direction === 'short' ? avgLong : avgShort

  return {
    trades: [{
      trade_date: statementDate,
      instrument,
      direction,
      contracts: totalContracts,
      entry_price: entryPrice,
      exit_price: exitPrice,
      pnl: totalPnl,
      fees: totalFees,
      notes: `Imported from daily statement. ${totalContracts} contract${totalContracts !== 1 ? 's' : ''}. Entry: ${entryPrice}, Exit: ${exitPrice}.`,
    }],
    fees: totalFees,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const rawBody = await getRawBody(req)
    const contentType = req.headers['content-type'] || ''
    const boundaryMatch = contentType.match(/boundary=(.+)/)
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' })

    const parts = parseMultipart(rawBody, boundaryMatch[1])
    const pdfPart = parts.find(p => p.headers.includes('filename'))
    if (!pdfPart) return res.status(400).json({ error: 'No PDF found in request' })

    // Use dynamic import for pdf-parse to avoid ESM issues
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js')
    const parsed = await pdfParse(pdfPart.data)
    const result = parseDailyStatement(parsed.text)
    res.status(200).json(result)
  } catch (err) {
    console.error('PDF parse error:', err)
    res.status(500).json({ error: err.message })
  }
}