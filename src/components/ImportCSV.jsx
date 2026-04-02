import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

function parsePrice(raw) {
  if (!raw || raw === '') return null
  return parseFloat(raw) / 100
}

function parseSymbol(raw) {
  if (!raw) return 'ES'
  const base = raw.split('.')[0]
  return base.replace(/[A-Z]\d+$/, '')
}

function parseFills(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const delim = lines[0].includes('\t') ? '\t' : ','
  const headers = lines[0].split(delim).map(h => h.trim())
  const idx = (name) => headers.indexOf(name)

  const rows = lines.slice(1).map(line => {
    const cols = line.split(delim)
    return {
      activityType: cols[idx('ActivityType')]?.trim(),
      dateTime:     cols[idx('DateTime')]?.trim(),
      symbol:       cols[idx('Symbol')]?.trim(),
      orderType:    cols[idx('OrderType')]?.trim(),
      quantity:     parseInt(cols[idx('FilledQuantity')] || cols[idx('Quantity')] || '0'),
      buySell:      cols[idx('BuySell')]?.trim(),
      fillPrice:    parsePrice(cols[idx('FillPrice')]?.trim()),
      openClose:    cols[idx('OpenClose')]?.trim(),
      positionQty:  parseInt(cols[idx('PositionQuantity')]?.trim() || '0'),
      orderStatus:  cols[idx('OrderStatus')]?.trim(),
    }
  }).filter(r =>
    r.activityType === 'Fills' &&
    (r.orderStatus === 'Filled' || r.orderStatus === 'Open') &&
    r.fillPrice !== null &&
    r.quantity > 0
  )

  return rows
}

function groupIntoTrades(fills) {
  const trades = []
  let position = 0
  let openFills = []
  let closeFills = []

  for (const fill of fills) {
    const qty = fill.quantity
    const isBuy = fill.buySell === 'Buy'
    const isOpen = fill.openClose === 'Open'
    const isClose = fill.openClose === 'Close'

    if (isOpen) {
      openFills.push(fill)
      position += isBuy ? qty : -qty
    } else if (isClose) {
      closeFills.push(fill)
      position += isBuy ? qty : -qty
    }

    if (position === 0 && openFills.length > 0 && closeFills.length > 0) {
      const symbol = parseSymbol(openFills[0].symbol)

      // Convert UTC to ET
      const rawTime = openFills[0].dateTime.trim()
      const utcDate = new Date(rawTime.replace(' ', 'T') + 'Z')
      const tradeDate = utcDate.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
      const entryTime = utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' })

      const firstOpen = openFills[0]
      const direction = firstOpen.buySell === 'Buy' ? 'long' : 'short'

      const totalEntryQty = openFills.reduce((s, f) => s + f.quantity, 0)
      const avgEntry = openFills.reduce((s, f) => s + f.fillPrice * f.quantity, 0) / totalEntryQty

      const totalExitQty = closeFills.reduce((s, f) => s + f.quantity, 0)
      const avgExit = closeFills.reduce((s, f) => s + f.fillPrice * f.quantity, 0) / totalExitQty

      const pointDiff = direction === 'long'
        ? avgExit - avgEntry
        : avgEntry - avgExit
      const pnl = Math.round(pointDiff * totalEntryQty * 50 * 100) / 100

      const uniqueKey = `${rawTime}-${symbol}-${direction}`

      trades.push({
        trade_date: tradeDate,
        instrument: symbol,
        direction,
        contracts: totalEntryQty,
        entry_price: Math.round(avgEntry * 100) / 100,
        exit_price: Math.round(avgExit * 100) / 100,
        pnl,
        entry_time: entryTime,
        unique_key: uniqueKey,
      })

      openFills = []
      closeFills = []
    }
  }

  return trades
}

export default function ImportCSV({ onImport }) {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const fills = parseFills(text)

      if (!fills.length) {
        setResult({ error: 'No valid fills found in file' })
        setImporting(false)
        return
      }

      const trades = groupIntoTrades(fills)

      if (!trades.length) {
        setResult({ error: 'No complete trades found — check file format' })
        setImporting(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setResult({ error: 'Not logged in' })
        setImporting(false)
        return
      }

      const { data: existing } = await supabase
        .from('trades')
        .select('notes')
        .eq('user_id', user.id)
        .like('notes', 'sierra:%')

      const existingKeys = new Set(
        (existing || []).map(t => t.notes?.replace('sierra:', ''))
      )

      const newTrades = trades.filter(t => !existingKeys.has(t.unique_key))
      const skipped = trades.length - newTrades.length

      if (!newTrades.length) {
        setResult({ skipped, imported: 0, total: trades.length })
        setImporting(false)
        return
      }

      const inserts = newTrades.map(t => ({
        user_id: user.id,
        trade_date: t.trade_date,
        instrument: t.instrument,
        direction: t.direction,
        contracts: t.contracts,
        entry_price: t.entry_price,
        exit_price: t.exit_price,
        pnl: t.pnl,
        notes: `sierra:${t.unique_key}`,
      }))

      const { error } = await supabase.from('trades').insert(inserts)
      if (error) throw error

      setResult({ imported: newTrades.length, skipped, total: trades.length })
      if (onImport) onImport()

    } catch (err) {
      setResult({ error: err.message })
    }

    setImporting(false)
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        className="btn-secondary"
        style={{ padding: '6px 14px', fontSize: 12, opacity: importing ? 0.5 : 1 }}
      >
        {importing ? 'IMPORTING...' : '↑ IMPORT CSV'}
      </button>
      {result && (
        <span style={{
          fontSize: 11,
          color: result.error ? 'var(--red)' : '#70c0ff',
          letterSpacing: '0.04em',
        }}>
          {result.error
            ? `ERROR: ${result.error}`
            : `✓ ${result.imported} imported${result.skipped ? `, ${result.skipped} skipped` : ''}`
          }
        </span>
      )}
    </>
  )
}