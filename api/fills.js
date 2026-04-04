// pages/api/fill.js
// Receives fill events from Sierra Chart ACSIL, calculates derived session state,
// and upserts to Supabase session_state (which fires realtime to the coach).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const FEES_PER_RT = 3.20

const SEGMENTS = [
  { name: 'pre',     start: '00:00', end: '09:29' },
  { name: '9:30-11', start: '09:30', end: '10:59' },
  { name: '11-12',   start: '11:00', end: '11:59' },
  { name: '12-2',    start: '12:00', end: '13:59' },
  { name: '2-4',     start: '14:00', end: '23:59' },
]

function getSegment(timestamp) {
  const d = new Date(timestamp)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const time = `${hh}:${mm}`
  // Convert UTC to ET (approximate — subtract 4 or 5 hours depending on DST)
  // For production, use a proper timezone library. Here we assume ET offset is provided
  // or fills arrive with ET-based session_date alignment.
  // Fallback: use the raw hour from timestamp
  const etHour = d.getUTCHours() - 4 // EDT approximation
  const etMin = d.getUTCMinutes()
  const etTime = `${String(Math.max(0, etHour)).padStart(2, '0')}:${String(etMin).padStart(2, '0')}`

  for (const seg of SEGMENTS) {
    if (etTime >= seg.start && etTime <= seg.end) return seg.name
  }
  return '2-4'
}

// Tick values per instrument
const TICK_VALUES = {
  MES: 1.25,   // $1.25 per tick, 4 ticks per point = $5/point
  ES:  12.50,  // $12.50 per tick, 4 ticks per point = $50/point
  MNQ: 0.50,   // $0.50 per tick, 4 ticks per point = $2/point
  NQ:  5.00,   // $5.00 per tick, 4 ticks per point = $20/point
  MCL: 1.00,   // $1.00 per tick (0.01), 100 ticks per point = $100/point — actually $10/point for MCL
  CL:  10.00,
  MGC: 1.00,
  GC:  10.00,
}

const POINT_VALUES = {
  MES: 5,
  ES: 50,
  MNQ: 2,
  NQ: 20,
  MCL: 10,
  CL: 1000,
  MGC: 10,
  GC: 100,
}

function calculateRealizedPnl(fills) {
  // FIFO matching: match buys and sells to calculate realized P&L
  // Group by instrument, match long fills against short fills
  const positions = {} // instrument -> { longs: [], shorts: [] }
  let realizedPnl = 0
  let roundTurns = 0
  const tradeResults = [] // track per-trade P&L for spiral detection

  for (const fill of fills) {
    const inst = fill.instrument.toUpperCase()
    if (!positions[inst]) positions[inst] = { longs: [], shorts: [] }
    const pos = positions[inst]
    const pointValue = POINT_VALUES[inst] || 5 // default to MES

    if (fill.direction === 'long') {
      // Try to close existing shorts first (FIFO)
      let remaining = fill.contracts
      while (remaining > 0 && pos.shorts.length > 0) {
        const short = pos.shorts[0]
        const matched = Math.min(remaining, short.contracts)
        const pnl = (short.fill_price - fill.fill_price) * matched * pointValue
        realizedPnl += pnl
        roundTurns += matched
        tradeResults.push(pnl)
        short.contracts -= matched
        remaining -= matched
        if (short.contracts <= 0) pos.shorts.shift()
      }
      if (remaining > 0) {
        pos.longs.push({ ...fill, contracts: remaining })
      }
    } else {
      // direction === 'short' — try to close existing longs first
      let remaining = fill.contracts
      while (remaining > 0 && pos.longs.length > 0) {
        const long = pos.longs[0]
        const matched = Math.min(remaining, long.contracts)
        const pnl = (fill.fill_price - long.fill_price) * matched * pointValue
        realizedPnl += pnl
        roundTurns += matched
        tradeResults.push(pnl)
        long.contracts -= matched
        remaining -= matched
        if (long.contracts <= 0) pos.longs.shift()
      }
      if (remaining > 0) {
        pos.shorts.push({ ...fill, contracts: remaining })
      }
    }
  }

  const fees = roundTurns * FEES_PER_RT
  const realizedNet = realizedPnl - fees

  return { realizedNet, roundTurns, tradeResults }
}

function detectSpiralWarning(tradeResults) {
  // Spiral: sized up after a loss (we detect consecutive losing trade followed by another trade)
  // More precisely: if the last closed trade was a loss, flag it
  if (tradeResults.length < 2) return false
  // Check if there was a loss followed by another trade (potential revenge)
  const lastTwo = tradeResults.slice(-2)
  return lastTwo[0] < 0 // previous trade was a loss, and they took another
}

function detectGrindWarning(fills) {
  // 3+ attempts at the same price level (within 2 points) on the same side
  if (fills.length < 6) return false // need at least 3 round trips
  const recentFills = fills.slice(-20) // look at recent activity
  const levelAttempts = {}
  for (const f of recentFills) {
    const key = `${f.instrument}-${f.direction}-${Math.round(f.fill_price / 2) * 2}` // round to nearest 2 points
    levelAttempts[key] = (levelAttempts[key] || 0) + 1
  }
  return Object.values(levelAttempts).some(count => count >= 3)
}

function calculatePeakAndDrawdown(fills) {
  // Walk through fills chronologically, calculating running realized P&L
  // Track peak and current drawdown
  const positions = {}
  let runningPnl = 0
  let roundTurns = 0
  let peak = 0

  for (const fill of fills) {
    const inst = fill.instrument.toUpperCase()
    if (!positions[inst]) positions[inst] = { longs: [], shorts: [] }
    const pos = positions[inst]
    const pointValue = POINT_VALUES[inst] || 5

    if (fill.direction === 'long') {
      let remaining = fill.contracts
      while (remaining > 0 && pos.shorts.length > 0) {
        const short = pos.shorts[0]
        const matched = Math.min(remaining, short.contracts)
        const pnl = (short.fill_price - fill.fill_price) * matched * pointValue
        runningPnl += pnl - (matched * FEES_PER_RT)
        roundTurns += matched
        short.contracts -= matched
        remaining -= matched
        if (short.contracts <= 0) pos.shorts.shift()
      }
      if (remaining > 0) pos.longs.push({ ...fill, contracts: remaining })
    } else {
      let remaining = fill.contracts
      while (remaining > 0 && pos.longs.length > 0) {
        const long = pos.longs[0]
        const matched = Math.min(remaining, long.contracts)
        const pnl = (fill.fill_price - long.fill_price) * matched * pointValue
        runningPnl += pnl - (matched * FEES_PER_RT)
        roundTurns += matched
        long.contracts -= matched
        remaining -= matched
        if (long.contracts <= 0) pos.longs.shift()
      }
      if (remaining > 0) pos.shorts.push({ ...fill, contracts: remaining })
    }

    // Update peak after each realized trade
    if (runningPnl > peak) peak = runningPnl
  }

  const drawdownFromPeak = peak > 0 ? ((peak - runningPnl) / peak) * 100 : 0

  return { peak, drawdownFromPeak, runningPnl }
}

function getDrawdownStage(drawdownPct) {
  if (drawdownPct >= 40) return 3
  if (drawdownPct >= 30) return 2
  if (drawdownPct >= 20) return 1
  return 0
}

export default async function handler(req, res) {
  // CORS headers for Sierra Chart ACSIL
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const fill = req.body

    // Validate required fields
    if (!fill.timestamp || !fill.instrument || !fill.direction || !fill.fill_price || !fill.contracts || !fill.order_id || !fill.session_date) {
      return res.status(400).json({ error: 'Missing required fields: timestamp, instrument, direction, fill_price, contracts, order_id, session_date' })
    }

    // 1. Insert raw fill
    const { error: insertError } = await supabase.from('fills').insert({
      session_date: fill.session_date,
      timestamp: fill.timestamp,
      instrument: fill.instrument,
      direction: fill.direction,
      fill_price: fill.fill_price,
      contracts: fill.contracts,
      order_id: fill.order_id,
    })

    if (insertError) {
      console.error('Fill insert error:', insertError)
      return res.status(500).json({ error: 'Failed to insert fill' })
    }

    // 2. Fetch all today's fills to recalculate state
    const { data: allFills, error: fetchError } = await supabase
      .from('fills')
      .select('*')
      .eq('session_date', fill.session_date)
      .order('timestamp')

    if (fetchError) {
      console.error('Fills fetch error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch fills' })
    }

    // 3. Calculate derived state
    const { realizedNet, roundTurns, tradeResults } = calculateRealizedPnl(allFills)
    const { peak, drawdownFromPeak } = calculatePeakAndDrawdown(allFills)
    const currentSegment = getSegment(fill.timestamp)

    // Count trades in current segment
    const segmentFills = allFills.filter(f => getSegment(f.timestamp) === currentSegment)
    // A "trade" = a round turn, approximate by counting direction changes or matched pairs
    const tradesThisSegment = Math.floor(segmentFills.length / 2)

    const spiralWarning = detectSpiralWarning(tradeResults)
    const grindWarning = detectGrindWarning(allFills)
    const overtradeWarning = tradesThisSegment >= 4
    const drawdownStage = getDrawdownStage(drawdownFromPeak)

    const derivedState = {
      session_date: fill.session_date,
      realized_pnl_net: Math.round(realizedNet * 100) / 100,
      session_peak: Math.round(peak * 100) / 100,
      drawdown_from_peak: Math.round(drawdownFromPeak * 10) / 10,
      total_trades: roundTurns,
      trades_this_segment: tradesThisSegment,
      current_segment: currentSegment,
      spiral_warning: spiralWarning,
      grind_warning: grindWarning,
      overtrade_warning: overtradeWarning,
      drawdown_stage: drawdownStage,
      updated_at: new Date().toISOString(),
    }

    // 4. Upsert session_state — Supabase realtime fires to coach
    const { error: upsertError } = await supabase
      .from('session_state')
      .upsert(derivedState)

    if (upsertError) {
      console.error('Session state upsert error:', upsertError)
      return res.status(500).json({ error: 'Failed to update session state' })
    }

    res.status(200).json({ ok: true, state: derivedState })
  } catch (err) {
    console.error('Fill handler error:', err)
    res.status(500).json({ error: err.message })
  }
}