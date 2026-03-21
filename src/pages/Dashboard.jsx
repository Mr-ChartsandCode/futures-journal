import { useNavigate } from 'react-router-dom'
import { useTrades } from '../hooks/useTrades'
import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns'

const tip = {
  contentStyle: { background: '#0c0c1e', border: '1px solid #2a2a4a', borderRadius: 6, fontSize: 11, boxShadow: '0 4px 20px rgba(0,0,20,0.8)' },
  itemStyle: { color: '#eeeef8' },
  labelStyle: { color: '#5a5a7a' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { trades, loading } = useTrades()
  const [period, setPeriod] = useState('1M')

  const filtered = useMemo(() => {
    const now = new Date()
    const cutoff = {
      '1W': new Date(now - 7 * 86400000),
      '1M': new Date(now.getFullYear(), now.getMonth(), 1),
      '3M': new Date(now.getFullYear(), now.getMonth() - 3, 1),
      'YTD': new Date(now.getFullYear(), 0, 1),
    }[period]
    return trades.filter(t => new Date(t.trade_date) >= cutoff)
  }, [trades, period])

  const stats = useMemo(() => {
    if (!filtered.length) return null
    const wins = filtered.filter(t => t.pnl > 0)
    const losses = filtered.filter(t => t.pnl < 0)
    const totalPnl = filtered.reduce((s, t) => s + t.pnl, 0)
    const winRate = Math.round((wins.length / filtered.length) * 100)
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0)
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : '—'
    const expectancy = (totalPnl / filtered.length).toFixed(2)
    return { totalPnl, winRate, avgWin, avgLoss, profitFactor, expectancy, wins: wins.length, total: filtered.length }
  }, [filtered])

  const equityData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date))
    let running = 0
    return sorted.map((t, i) => ({ i: i + 1, pnl: Math.round((running += t.pnl) * 100) / 100 }))
  }, [filtered])

  const dailyData = useMemo(() => {
    const map = {}
    filtered.forEach(t => { map[t.trade_date] = (map[t.trade_date] || 0) + t.pnl })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => ({ date: format(new Date(date + 'T00:00:00'), 'MM/dd'), pnl: Math.round(pnl * 100) / 100 }))
  }, [filtered])

  const calendarData = useMemo(() => {
    const map = {}
    filtered.forEach(t => { map[t.trade_date] = (map[t.trade_date] || 0) + t.pnl })
    return map
  }, [filtered])

  const now = new Date()
  const calDays = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
  const firstDow = startOfMonth(now).getDay()
  const firstWeekday = startOfMonth(now).getDay()
  const blanks = Array(firstWeekday === 0 ? 4 : Math.min(firstWeekday - 1, 4)).fill(null)

  function calColor(pnl) {
    if (pnl === undefined) return { bg: 'var(--surface)', color: 'var(--muted2)', glow: 'none' }
    if (pnl > 500)  return { bg: 'linear-gradient(160deg,#001e44,#000e28)', color: '#70c0ff', glow: '0 0 6px rgba(0,100,255,0.3)' }
    if (pnl > 0)    return { bg: 'linear-gradient(160deg,#001030,#000820)', color: '#4090cc', glow: 'none' }
    if (pnl < -500) return { bg: 'linear-gradient(160deg,#280008,#180004)', color: '#ff6060', glow: '0 0 6px rgba(255,0,0,0.3)' }
    if (pnl < 0)    return { bg: 'linear-gradient(160deg,#180006,#100004)', color: '#cc4040', glow: 'none' }
    return { bg: 'var(--surface)', color: 'var(--muted)', glow: 'none' }
  }

  const fmt = (n) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px' }}>

      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-hi)', letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,132,255,0.5)' }}>
          FuturesJournal
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'linear-gradient(180deg,#0e0e20,#080810)', border: '1px solid var(--border)', borderRadius: 7, padding: 3, gap: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
            {['1W','1M','3M','YTD'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={period === p ? 'tab-active' : 'tab-inactive'}>{p}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => navigate('/add')} style={{ padding: '6px 14px' }}>+ NEW TRADE</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '2rem', textAlign: 'center', fontSize: 12, letterSpacing: '0.05em' }}>LOADING...</div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 12, marginBottom: 16, letterSpacing: '0.05em' }}>NO TRADES FOR THIS PERIOD</div>
          <button className="btn-primary" onClick={() => navigate('/add')} style={{ padding: '8px 20px' }}>+ NEW TRADE</button>
        </div>
      ) : (<>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 8 }}>
          {[
            { label: 'Net P&L', value: fmt(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative', sub: `${stats.total} trades` },
            { label: 'Win rate', value: `${stats.winRate}%`, cls: '', sub: `${stats.wins} W · ${stats.total - stats.wins} L` },
            { label: 'Avg winner', value: fmt(stats.avgWin), cls: 'pnl-positive', sub: `Loser ${stats.avgLoss !== 0 ? fmt(stats.avgLoss) : '—'}` },
            { label: 'Profit factor', value: stats.profitFactor, cls: '', sub: `Expect. $${stats.expectancy}` },
          ].map(({ label, value, cls, sub }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div className={cls} style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Equity curve</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={equityData}>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={['auto','auto']} />
                <Tooltip {...tip} formatter={v => [fmt(v), 'P&L']} labelFormatter={l => `Trade ${l}`} />
                <Line type="monotone" dataKey="pnl" stroke="var(--blue)" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Daily P&L</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={dailyData} barCategoryGap="20%">
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#3a3a5a' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto','auto']} />
                <Tooltip {...tip} formatter={v => [fmt(v), 'P&L']} />
                <Bar dataKey="pnl" radius={[2,2,0,0]}>
                  {dailyData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'var(--profit)' : 'var(--loss)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{format(now, 'MMMM yyyy')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
              {['Mon','Tue','Wed','Thu','Fri'].map((d, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', paddingBottom: 8, fontWeight: 600, letterSpacing: '0.04em' }}>{d}</div>
              ))}
              {blanks.filter((_, i) => i < 5).map((_, i) => <div key={`b${i}`} />)}
              {calDays.filter(day => !isWeekend(day)).map(day => {
                const key = format(day, 'yyyy-MM-dd')
                const pnl = calendarData[key]
                const { bg, color, glow } = calColor(pnl)
                return (
                  <div key={key} title={pnl !== undefined ? fmt(pnl) : ''} style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    background: bg,
                    boxShadow: glow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    cursor: pnl !== undefined ? 'pointer' : 'default',
                    border: pnl !== undefined ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border)',
                    padding: '6px 4px',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{format(day, 'd')}</span>
                    {pnl !== undefined
                      ? <span style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{pnl >= 0 ? '+' : ''}{Math.round(pnl)}</span>
                      : <span style={{ fontSize: 11, color: 'var(--muted2)' }}>—</span>
                    }
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Recent trades</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.slice(0, 8).map((t, i) => (
                <div key={t.id} onClick={() => navigate(`/trade/${t.id}`)} style={{
                  display: 'grid', gridTemplateColumns: '40px 36px 1fr auto',
                  alignItems: 'center', gap: 8, padding: '7px 0',
                  borderBottom: i < Math.min(filtered.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s', borderRadius: 4,
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 12 }}>{t.instrument}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: t.direction === 'long' ? 'var(--blue-text)' : 'var(--red-text)' }}>
                    {t.direction === 'long' ? 'LONG' : 'SHRT'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t.trade_date}</span>
                  <span className={t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'} style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
                    {fmt(t.pnl)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </>)}
    </div>
  )
}