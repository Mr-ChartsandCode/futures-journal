import { useState, useMemo } from 'react'

// ── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_TRADES = (() => {
  const setups = ['Break & Retest', 'VWAP Reclaim', 'Opening Range', 'Trend Continuation', 'Mean Reversion', 'Liquidity Grab']
  const instruments = ['ES', 'NQ', 'CL', 'GC', 'MES', 'MNQ']
  const emotions = ['Calm', 'Confident', 'Anxious', 'Revenge', 'FOMO', 'Neutral']
  const days = [1, 2, 3, 4, 5] // Mon-Fri
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

  const tickValues = { ES: 12.5, NQ: 5, CL: 10, GC: 10, MES: 1.25, MNQ: 0.5 }

  const setupBias = {
    'Break & Retest':       { winRate: 0.62, avgR: 1.8, stdDev: 0.4 },
    'VWAP Reclaim':         { winRate: 0.55, avgR: 1.5, stdDev: 0.5 },
    'Opening Range':        { winRate: 0.48, avgR: 2.1, stdDev: 0.8 },
    'Trend Continuation':   { winRate: 0.67, avgR: 1.6, stdDev: 0.3 },
    'Mean Reversion':       { winRate: 0.44, avgR: 1.3, stdDev: 0.6 },
    'Liquidity Grab':       { winRate: 0.71, avgR: 2.4, stdDev: 0.5 },
  }

  const emotionBias = {
    'Calm':       1.2, 'Confident': 1.1, 'Neutral': 1.0,
    'Anxious':   0.6, 'FOMO':      0.4, 'Revenge':  0.2,
  }

  const dayBias   = { 1: 1.1, 2: 1.2, 3: 0.9, 4: 1.0, 5: 0.7 }
  const hourBias  = { 7:1.3,8:1.4,9:1.2,10:1.1,11:0.9,12:0.7,13:0.8,14:1.0,15:1.1,16:0.8 }

  const trades = []
  const start = new Date('2026-01-02')

  for (let i = 0; i < 120; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + Math.floor(i * 1.8))
    const dow = date.getDay()
    if (dow === 0 || dow === 6) date.setDate(date.getDate() + 1)

    const setup    = setups[Math.floor(Math.random() * setups.length)]
    const instr    = instruments[Math.floor(Math.random() * instruments.length)]
    const emotion  = emotions[Math.floor(Math.random() * emotions.length)]
    const hour     = hours[Math.floor(Math.random() * hours.length)]
    const bias     = setupBias[setup]
    const eBias    = emotionBias[emotion]
    const dBias    = dayBias[date.getDay()] || 1
    const hBias    = hourBias[hour] || 1
    const adjWR    = Math.min(0.95, Math.max(0.05, bias.winRate * eBias * dBias * hBias))
    const win      = Math.random() < adjWR
    const ticks    = win
      ? Math.round((bias.avgR + (Math.random() - 0.5) * bias.stdDev * 4) * 4) * 2
      : -Math.round((1 + Math.random() * 1.5) * 4) * 2
    const pnl      = ticks * tickValues[instr]
    const stopW    = Math.round(4 + Math.random() * 12)
    const mae      = win ? -Math.round(Math.random() * stopW * 0.6) : ticks
    const mfe      = win ? ticks + Math.round(Math.random() * 8) : Math.round(Math.random() * 4)

    date.setHours(hour, Math.floor(Math.random() * 60))

    trades.push({
      id: i, date: date.toISOString(), instrument: instr,
      setup, emotion, pnl, ticks, win,
      stopWidth: stopW, mae, mfe,
      rr: win ? +(ticks / (stopW * 2)).toFixed(2) : +(ticks / (stopW * 2)).toFixed(2),
      hour, dow: date.getDay(),
    })
  }
  return trades.sort((a, b) => new Date(a.date) - new Date(b.date))
})()

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAYS   = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS  = [7,8,9,10,11,12,13,14,15,16]
const CARD   = { background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderTop: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 16px' }
const LABEL  = { fontSize: 10, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }

function pf(wins, losses) {
  const g = wins.reduce((s, t) => s + t.pnl, 0)
  const l = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
  return l === 0 ? '∞' : (g / l).toFixed(2)
}

function avg(arr) { return arr.length ? arr.reduce((s,v) => s+v, 0) / arr.length : 0 }

function color(v, neutral = 0) {
  if (v === null || v === undefined) return '#666'
  return v > neutral ? '#70c0ff' : v < neutral ? '#ff6060' : '#888'
}

function fmt(n) {
  if (n === null || n === undefined) return '—'
  const s = n >= 0 ? '+' : ''
  return `${s}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function heatColor(val, max) {
  if (!val || max === 0) return '#0a0a0a'
  const intensity = Math.abs(val) / max
  if (val > 0) return `rgba(112,192,255,${0.15 + intensity * 0.7})`
  return `rgba(255,96,96,${0.15 + intensity * 0.7})`
}

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, colorFn }) {
  const max = Math.max(...data.map(d => Math.abs(d[valueKey])))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((d, i) => {
        const val = d[valueKey]
        const pct = max > 0 ? Math.abs(val) / max * 100 : 0
        const c = colorFn ? colorFn(val) : color(val)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 110, fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0 }}>{d[labelKey]}</div>
            <div style={{ flex: 1, height: 18, background: '#0a0a0a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ width: 60, fontSize: 11, color: c, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{d.label2 || val}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Equity Curve ─────────────────────────────────────────────────────────────
function EquityCurve({ trades }) {
  let cum = 0
  const points = trades.map(t => { cum += t.pnl; return cum })
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const W = 600, H = 120
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  const fillPts = `0,${H} ${pts} ${W},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#70c0ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#70c0ff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#eq)" />
      <polyline points={pts} fill="none" stroke="#70c0ff" strokeWidth="1.5" />
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Analytics() {
  const [tab, setTab] = useState('setups')
  const trades = SAMPLE_TRADES
  const wins   = trades.filter(t => t.win)
  const losses = trades.filter(t => !t.win)

  const stats = useMemo(() => {
    const totalPnl   = trades.reduce((s, t) => s + t.pnl, 0)
    const winRate    = wins.length / trades.length
    const avgWin     = avg(wins.map(t => t.pnl))
    const avgLoss    = avg(losses.map(t => t.pnl))
    const profitFactor = pf(wins, losses)
    const avgRR      = avg(trades.map(t => t.rr))
    const bestTrade  = Math.max(...trades.map(t => t.pnl))
    const worstTrade = Math.min(...trades.map(t => t.pnl))

    // Drawdown
    let cum = 0, peak = 0, maxDD = 0
    trades.forEach(t => {
      cum += t.pnl
      if (cum > peak) peak = cum
      const dd = peak - cum
      if (dd > maxDD) maxDD = dd
    })

    // Streak
    let curStreak = 0, maxWinStreak = 0, maxLossStreak = 0
    let streakType = null
    trades.forEach(t => {
      if (t.win) {
        if (streakType === 'win') curStreak++
        else { curStreak = 1; streakType = 'win' }
        if (curStreak > maxWinStreak) maxWinStreak = curStreak
      } else {
        if (streakType === 'loss') curStreak++
        else { curStreak = 1; streakType = 'loss' }
        if (curStreak > maxLossStreak) maxLossStreak = curStreak
      }
    })

    return { totalPnl, winRate, avgWin, avgLoss, profitFactor, avgRR, bestTrade, worstTrade, maxDD, maxWinStreak, maxLossStreak }
  }, [trades])

  // Setup scorecard
  const setupStats = useMemo(() => {
    const setups = [...new Set(trades.map(t => t.setup))]
    return setups.map(s => {
      const st = trades.filter(t => t.setup === s)
      const sw = st.filter(t => t.win)
      const sl = st.filter(t => !t.win)
      const totalPnl = st.reduce((a, t) => a + t.pnl, 0)
      const avgMAE = avg(st.map(t => t.mae))
      const avgMFE = avg(st.map(t => t.mfe))
      return {
        setup: s, trades: st.length,
        winRate: sw.length / st.length,
        pnl: totalPnl,
        profitFactor: pf(sw, sl),
        avgRR: avg(st.map(t => t.rr)),
        avgMAE: avgMAE.toFixed(1),
        avgMFE: avgMFE.toFixed(1),
        score: (sw.length / st.length) * parseFloat(pf(sw, sl)) * (totalPnl > 0 ? 1 : -1),
      }
    }).sort((a, b) => b.score - a.score)
  }, [trades])

  // Time heatmap
  const timeHeatmap = useMemo(() => {
    const grid = {}
    DAYS.forEach((d, di) => {
      if (!d) return
      HOURS.forEach(h => {
        const key = `${di}-${h}`
        const ts = trades.filter(t => t.dow === di && t.hour === h)
        grid[key] = ts.length ? ts.reduce((s, t) => s + t.pnl, 0) : null
      })
    })
    return grid
  }, [trades])

  const heatMax = Math.max(...Object.values(timeHeatmap).filter(Boolean).map(Math.abs))

  // Day of week stats
  const dowStats = useMemo(() => {
    return [1,2,3,4,5].map(d => {
      const dt = trades.filter(t => t.dow === d)
      const dw = dt.filter(t => t.win)
      return {
        day: DAYS[d], trades: dt.length,
        pnl: dt.reduce((s,t) => s+t.pnl, 0),
        winRate: dt.length ? dw.length/dt.length : 0,
        label2: fmt(dt.reduce((s,t) => s+t.pnl, 0))
      }
    })
  }, [trades])

  // Instrument stats
  const instrStats = useMemo(() => {
    const instrs = [...new Set(trades.map(t => t.instrument))]
    return instrs.map(inst => {
      const it = trades.filter(t => t.instrument === inst)
      const iw = it.filter(t => t.win)
      return {
        instrument: inst, trades: it.length,
        pnl: it.reduce((s,t) => s+t.pnl, 0),
        winRate: it.length ? iw.length/it.length : 0,
        profitFactor: pf(iw, it.filter(t => !t.win)),
        label2: fmt(it.reduce((s,t) => s+t.pnl, 0))
      }
    }).sort((a, b) => b.pnl - a.pnl)
  }, [trades])

  // Emotion stats
  const emotionStats = useMemo(() => {
    const emos = [...new Set(trades.map(t => t.emotion))]
    return emos.map(e => {
      const et = trades.filter(t => t.emotion === e)
      const ew = et.filter(t => t.win)
      return {
        emotion: e, trades: et.length,
        pnl: et.reduce((s,t) => s+t.pnl, 0),
        winRate: et.length ? ew.length/et.length : 0,
        avgPnl: avg(et.map(t => t.pnl)),
        label2: fmt(et.reduce((s,t) => s+t.pnl, 0))
      }
    }).sort((a, b) => b.pnl - a.pnl)
  }, [trades])

  // Stop loss analysis
  const stopAnalysis = useMemo(() => {
    const buckets = { '1-4': [], '5-8': [], '9-12': [], '13+': [] }
    trades.forEach(t => {
      if (t.stopWidth <= 4) buckets['1-4'].push(t)
      else if (t.stopWidth <= 8) buckets['5-8'].push(t)
      else if (t.stopWidth <= 12) buckets['9-12'].push(t)
      else buckets['13+'].push(t)
    })
    return Object.entries(buckets).map(([range, ts]) => {
      const tw = ts.filter(t => t.win)
      return {
        range, trades: ts.length,
        winRate: ts.length ? tw.length/ts.length : 0,
        pnl: ts.reduce((s,t) => s+t.pnl, 0),
        label2: fmt(ts.reduce((s,t) => s+t.pnl, 0))
      }
    })
  }, [trades])

  // Performance killers
  const killers = useMemo(() => {
    const issues = []
    emotionStats.forEach(e => {
      if (e.winRate < 0.4 && e.trades >= 3)
        issues.push({ type: 'EMOTION', severity: 'HIGH', message: `Trading while ${e.emotion.toLowerCase()} — ${(e.winRate*100).toFixed(0)}% win rate, avg ${fmt(e.avgPnl)} per trade`, action: `Avoid trading when feeling ${e.emotion.toLowerCase()}` })
    })
    dowStats.forEach(d => {
      if (d.pnl < -200 && d.trades >= 3)
        issues.push({ type: 'DAY', severity: 'HIGH', message: `${d.day} is your worst day — ${fmt(d.pnl)} total P&L`, action: `Consider reducing size or sitting out on ${d.day}` })
    })
    setupStats.forEach(s => {
      if (s.pnl < 0 && s.trades >= 3)
        issues.push({ type: 'SETUP', severity: 'HIGH', message: `${s.setup} is losing money — ${fmt(s.pnl)} total`, action: `Remove or paper trade ${s.setup} until edge is redefined` })
      else if (parseFloat(s.profitFactor) < 1.2 && s.trades >= 5)
        issues.push({ type: 'SETUP', severity: 'MEDIUM', message: `${s.setup} has weak profit factor (${s.profitFactor}) — barely profitable`, action: `Refine entry criteria for ${s.setup}` })
    })
    const bestHour = Object.entries(
      trades.reduce((acc, t) => { acc[t.hour] = (acc[t.hour]||0) + t.pnl; return acc }, {})
    ).sort((a,b) => b[1]-a[1])[0]
    const worstHour = Object.entries(
      trades.reduce((acc, t) => { acc[t.hour] = (acc[t.hour]||0) + t.pnl; return acc }, {})
    ).sort((a,b) => a[1]-b[1])[0]
    if (worstHour && worstHour[1] < -300)
      issues.push({ type: 'TIME', severity: 'MEDIUM', message: `${worstHour[0]}:00 is your worst hour — ${fmt(worstHour[1])} total`, action: `Avoid or reduce size at ${worstHour[0]}:00` })
    return issues
  }, [emotionStats, dowStats, setupStats, trades])

  const TABS = ['setups', 'time', 'instruments', 'psychology', 'killers']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: '#f0f0f0', textTransform: 'uppercase' }}>Analytics</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontWeight: tab === t ? 700 : 400, textTransform: 'uppercase', letterSpacing: '0.04em',
                background: tab === t ? '#001428' : 'transparent',
                color: tab === t ? '#70c0ff' : '#555',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 10, color: '#333', letterSpacing: '0.05em' }}>SAMPLE DATA — {trades.length} TRADES</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>

        {tab === 'setups' && (
          <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={LABEL}>Setup Scorecard — ranked by edge score</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    {['Setup', 'Trades', 'Win %', 'P&L', 'Prof. Factor', 'Avg R:R', 'Avg MAE', 'Avg MFE', 'Verdict'].map(h => (
                      <th key={h} style={{ padding: '8px 6px', textAlign: h === 'Setup' ? 'left' : 'right', color: '#555', fontWeight: 600, fontSize: 10, letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {setupStats.map((s, i) => {
                    const verdict = s.pnl > 0 && parseFloat(s.profitFactor) > 1.5 && s.winRate > 0.55
                      ? { label: '✓ KEEP', color: '#70c0ff' }
                      : s.pnl < 0
                      ? { label: '✗ CUT', color: '#ff4444' }
                      : { label: '~ REFINE', color: '#ffaa40' }
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '8px 6px', color: '#e0e0e0', fontWeight: 600 }}>{s.setup}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#666' }}>{s.trades}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: color(s.winRate - 0.5) }}>{(s.winRate*100).toFixed(0)}%</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: color(s.pnl) }}>{fmt(s.pnl)}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: color(parseFloat(s.profitFactor) - 1.5) }}>{s.profitFactor}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: color(s.avgRR - 1) }}>{s.avgRR.toFixed(2)}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#888' }}>{s.avgMAE}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#888' }}>{s.avgMFE}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 700, fontSize: 11, color: verdict.color }}>{verdict.label}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={CARD}>
                <div style={LABEL}>P&L by setup</div>
                <BarChart data={setupStats.map(s => ({ ...s, labelKey: s.setup, label2: fmt(s.pnl) }))} valueKey="pnl" labelKey="setup" colorFn={color} />
              </div>
              <div style={CARD}>
                <div style={LABEL}>Stop loss width analysis</div>
                <BarChart data={stopAnalysis.map(s => ({ ...s, labelKey: s.range }))} valueKey="pnl" labelKey="range" colorFn={color} />
                <div style={{ marginTop: 12, fontSize: 11, color: '#555' }}>
                  Best stop range: <span style={{ color: '#70c0ff', fontWeight: 700 }}>
                    {stopAnalysis.sort((a,b) => b.pnl - a.pnl)[0]?.range} ticks
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'time' && (
          <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={LABEL}>P&L heatmap — day × hour (EDT)</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '4px 8px', color: '#555', fontWeight: 600, width: 50 }}></th>
                      {HOURS.map(h => (
                        <th key={h} style={{ padding: '4px 6px', color: '#aaa', fontWeight: 600, textAlign: 'center', width: 70 }}>{h}:00</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5].map(d => (
                      <tr key={d}>
                        <td style={{ padding: '4px 8px', color: '#ccc', fontWeight: 700, fontSize: 12 }}>{DAYS[d]}</td>
                        {HOURS.map(h => {
                          const val = timeHeatmap[`${d}-${h}`]
                          return (
                            <td key={h} style={{
                              padding: '8px 4px', textAlign: 'center', borderRadius: 4,
                              background: heatColor(val, heatMax),
                              color: val === null ? '#444' : '#ffffff',
                              fontWeight: 700, fontSize: 11,
                            }}>
                              {val === null ? '·' : val >= 0 ? `+${val.toFixed(0)}` : val.toFixed(0)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={CARD}>
                <div style={LABEL}>P&L by day of week</div>
                <BarChart data={dowStats} valueKey="pnl" labelKey="day" colorFn={color} />
              </div>
              <div style={CARD}>
                <div style={LABEL}>Win rate by day</div>
                <BarChart
                  data={dowStats.map(d => ({ ...d, label2: `${(d.winRate*100).toFixed(0)}%` }))}
                  valueKey="winRate"
                  labelKey="day"
                  colorFn={v => color(v - 0.5)}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'instruments' && (
          <div style={{ flex: 1, overflowY: 'auto', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={CARD}>
              <div style={LABEL}>P&L by instrument</div>
              <BarChart data={instrStats} valueKey="pnl" labelKey="instrument" colorFn={color} />
            </div>
            <div style={CARD}>
              <div style={LABEL}>Win rate by instrument</div>
              <BarChart
                data={instrStats.map(i => ({ ...i, label2: `${(i.winRate*100).toFixed(0)}%` }))}
                valueKey="winRate"
                labelKey="instrument"
                colorFn={v => color(v - 0.5)}
              />
            </div>
            <div style={{ ...CARD, gridColumn: '1 / -1' }}>
              <div style={LABEL}>Instrument breakdown</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    {['Instrument', 'Trades', 'Win %', 'Total P&L', 'Profit Factor'].map(h => (
                      <th key={h} style={{ padding: '8px', textAlign: h === 'Instrument' ? 'left' : 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instrStats.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '8px', color: '#e0e0e0', fontWeight: 700 }}>{s.instrument}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#666' }}>{s.trades}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(s.winRate - 0.5) }}>{(s.winRate*100).toFixed(0)}%</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(s.pnl) }}>{fmt(s.pnl)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(parseFloat(s.profitFactor) - 1.5) }}>{s.profitFactor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'psychology' && (
          <div style={{ flex: 1, overflowY: 'auto', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
            <div style={CARD}>
              <div style={LABEL}>P&L by emotion</div>
              <BarChart data={emotionStats} valueKey="pnl" labelKey="emotion" colorFn={color} />
            </div>
            <div style={CARD}>
              <div style={LABEL}>Win rate by emotion</div>
              <BarChart
                data={emotionStats.map(e => ({ ...e, label2: `${(e.winRate*100).toFixed(0)}%` }))}
                valueKey="winRate"
                labelKey="emotion"
                colorFn={v => color(v - 0.5)}
              />
            </div>
            <div style={{ ...CARD, gridColumn: '1 / -1' }}>
              <div style={LABEL}>Emotion breakdown</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    {['Emotion', 'Trades', 'Win %', 'Total P&L', 'Avg P&L/trade'].map(h => (
                      <th key={h} style={{ padding: '8px', textAlign: h === 'Emotion' ? 'left' : 'right', color: '#555', fontWeight: 600, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emotionStats.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '8px', color: '#e0e0e0', fontWeight: 700 }}>{e.emotion}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#666' }}>{e.trades}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(e.winRate - 0.5) }}>{(e.winRate*100).toFixed(0)}%</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(e.pnl) }}>{fmt(e.pnl)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: color(e.avgPnl) }}>{fmt(e.avgPnl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'killers' && (
          <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
            <div style={{ marginBottom: 16, fontSize: 12, color: '#555' }}>
              Automatically identified patterns that are hurting your performance. Based on {trades.length} trades.
            </div>
            {killers.length === 0 && (
              <div style={{ ...CARD, color: '#70c0ff', textAlign: 'center', padding: 32 }}>
                No performance killers detected — keep trading!
              </div>
            )}
            {killers.map((k, i) => (
              <div key={i} style={{
                ...CARD, marginBottom: 10,
                borderLeft: `3px solid ${k.severity === 'HIGH' ? '#ff4444' : '#ffaa40'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em',
                    background: k.severity === 'HIGH' ? '#1a0000' : '#1a0e00',
                    color: k.severity === 'HIGH' ? '#ff4444' : '#ffaa40',
                    border: `1px solid ${k.severity === 'HIGH' ? '#600000' : '#604000'}`,
                  }}>{k.severity}</span>
                  <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', fontWeight: 700 }}>{k.type}</span>
                </div>
                <div style={{ fontSize: 14, color: '#e0e0e0', marginBottom: 8 }}>{k.message}</div>
                <div style={{ fontSize: 12, color: '#70c0ff' }}>→ {k.action}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}