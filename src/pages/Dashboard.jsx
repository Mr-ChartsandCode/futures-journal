import { useNavigate } from 'react-router-dom'
import { useTrades } from '../hooks/useTrades'
import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns'
import ImportPDF from '../components/ImportPDF'
import { supabase } from '../lib/supabase'

const tip = {
  contentStyle: { background: '#0c0c1e', border: '1px solid #2a2a4a', borderRadius: 6, fontSize: 15, boxShadow: '0 4px 20px rgba(0,0,20,0.8)' },
  itemStyle: { color: '#eeeef8' },
  labelStyle: { color: '#5a5a7a' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { trades, loading } = useTrades()
  const [period, setPeriod] = useState('1M')
  const [filterInstruments, setFilterInstruments] = useState([])
  const [filterDirection, setFilterDirection] = useState('')
  const [filterTags, setFilterTags] = useState([])
  const [filterEmotion, setFilterEmotion] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [showDateRange, setShowDateRange] = useState(false)

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

  const tradeFiltered = useMemo(() => {
    return filtered.filter(t => {
      if (filterInstruments.length && !filterInstruments.includes(t.instrument)) return false
      if (filterDirection && t.direction !== filterDirection) return false
      if (filterEmotion && t.emotion !== filterEmotion) return false
      if (filterDateFrom && t.trade_date < filterDateFrom) return false
      if (filterDateTo && t.trade_date > filterDateTo) return false
      if (filterTags.length) {
        const tradeTags = t.trade_tags?.map(tt => tt.tags?.name).filter(Boolean) || []
        if (!filterTags.every(tag => tradeTags.includes(tag))) return false
      }
      return true
    })
  }, [filtered, filterInstruments, filterDirection, filterEmotion, filterDateFrom, filterDateTo, filterTags])

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

    let cum = 0, peak = 0, maxDD = 0
    ;[...filtered].sort((a,b) => new Date(a.trade_date) - new Date(b.trade_date)).forEach(t => {
      cum += t.pnl
      if (cum > peak) peak = cum
      const dd = peak - cum
      if (dd > maxDD) maxDD = dd
    })

    let curStreak = 0, maxWinStreak = 0, maxLossStreak = 0, streakType = null
    ;[...filtered].sort((a,b) => new Date(a.trade_date) - new Date(b.trade_date)).forEach(t => {
      if (t.pnl > 0) {
        streakType === 'win' ? curStreak++ : (curStreak = 1, streakType = 'win')
        if (curStreak > maxWinStreak) maxWinStreak = curStreak
      } else {
        streakType === 'loss' ? curStreak++ : (curStreak = 1, streakType = 'loss')
        if (curStreak > maxLossStreak) maxLossStreak = curStreak
      }
    })

    const bestTrade = Math.max(...filtered.map(t => t.pnl))

    const setupMap = {}
    filtered.forEach(t => {
      const tag = t.trade_tags?.[0]?.tags?.name || 'Untagged'
      if (!setupMap[tag]) setupMap[tag] = { pnl: 0, trades: 0, wins: 0 }
      setupMap[tag].pnl += t.pnl
      setupMap[tag].trades++
      if (t.pnl > 0) setupMap[tag].wins++
    })
    const setupEntries = Object.entries(setupMap)
    const bestSetup = [...setupEntries].sort((a,b) => b[1].pnl - a[1].pnl)[0]
    const worstSetup = [...setupEntries].sort((a,b) => a[1].pnl - b[1].pnl)[0]

    return { totalPnl, winRate, avgWin, avgLoss, profitFactor, expectancy, wins: wins.length, total: filtered.length,
      maxDD, maxWinStreak, maxLossStreak, bestTrade, bestSetup, worstSetup }
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

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function clearFilters() {
    setFilterInstruments([])
    setFilterDirection('')
    setFilterTags([])
    setFilterEmotion('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setShowDateRange(false)
  }

  const hasFilters = filterInstruments.length || filterDirection || filterTags.length || filterEmotion || filterDateFrom || filterDateTo

  const activeFilterLabel = [
    ...filterInstruments,
    filterDirection ? filterDirection.toUpperCase() : '',
    ...filterTags,
    filterEmotion ? filterEmotion.replace('_', ' ') : '',
    filterDateFrom ? `from ${filterDateFrom}` : '',
    filterDateTo ? `to ${filterDateTo}` : '',
  ].filter(Boolean).join(' · ')

  const fmt = (n) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  async function handlePDFImport(trades) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    for (const trade of trades) {
      await supabase.from('trades').insert({
        user_id: user.id,
        trade_date: trade.trade_date,
        instrument: trade.instrument,
        direction: trade.direction,
        contracts: trade.contracts,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        pnl: trade.pnl,
        notes: trade.notes,
      })
    }
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px' }}>

      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 12, paddingBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--blue-hi)', letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(0,132,255,0.5)' }}>
          FuturesJournal
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'linear-gradient(180deg,#0e0e20,#080810)', border: '1px solid var(--border)', borderRadius: 7, padding: 3, gap: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
            {['1W','1M','3M','YTD'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={period === p ? 'tab-active' : 'tab-inactive'}>{p}</button>
            ))}
          </div>
          <ImportPDF onImport={handlePDFImport} />
          <button className="btn-primary" onClick={() => navigate('/add')} style={{ padding: '6px 14px' }}>+ NEW TRADE</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '2rem', textAlign: 'center', fontSize: 13, letterSpacing: '0.05em' }}>LOADING...</div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 13, marginBottom: 16, letterSpacing: '0.05em' }}>NO TRADES FOR THIS PERIOD</div>
          <button className="btn-primary" onClick={() => navigate('/add')} style={{ padding: '8px 20px' }}>+ NEW TRADE</button>
        </div>
      ) : (<>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 8, marginBottom: 8 }}>
          {[
            { label: 'Net P&L', value: fmt(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative', sub: `${stats.total} trades` },
            { label: 'Win rate', value: `${stats.winRate}%`, cls: '', sub: `${stats.wins} W · ${stats.total - stats.wins} L` },
            { label: 'Avg winner', value: fmt(stats.avgWin), cls: 'pnl-positive', sub: `Loser ${stats.avgLoss !== 0 ? fmt(stats.avgLoss) : '—'}` },
            { label: 'Profit factor', value: stats.profitFactor, cls: '', sub: `Expect. $${stats.expectancy}` },
            { label: 'Max Drawdown', value: `-$${stats.maxDD.toFixed(0)}`, cls: 'pnl-negative', sub: '' },
            { label: 'Best Trade', value: fmt(stats.bestTrade), cls: 'pnl-positive', sub: '' },
            { label: 'Max Win Streak', value: `${stats.maxWinStreak}`, cls: '', sub: 'consecutive wins' },
            { label: 'Max Loss Streak', value: `${stats.maxLossStreak}`, cls: '', sub: 'consecutive losses' },
            { label: 'Total Trades', value: stats.total, cls: '', sub: `${stats.wins}W · ${stats.total - stats.wins}L` },
          ].map(({ label, value, cls, sub }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div className={cls} style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
          {stats.bestSetup && (
            <div className="stat-card">
              <div style={{ fontSize: 14, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Best · Worst Setup</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#70c0ff', marginBottom: 2 }}>{stats.bestSetup[0]}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fmt(stats.bestSetup[1].pnl)} · {Math.round(stats.bestSetup[1].wins/stats.bestSetup[1].trades*100)}%</div>
                </div>
                {stats.worstSetup && stats.worstSetup[0] !== stats.bestSetup[0] && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6060', marginBottom: 2 }}>{stats.worstSetup[0]}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fmt(stats.worstSetup[1].pnl)} · {Math.round(stats.worstSetup[1].wins/stats.worstSetup[1].trades*100)}%</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Equity curve</div>
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
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Daily P&L</div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{format(now, 'MMMM yyyy')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
              {['Mon','Tue','Wed','Thu','Fri'].map((d, i) => (
                <div key={i} style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', paddingBottom: 8, fontWeight: 600, letterSpacing: '0.04em' }}>{d}</div>
              ))}
              {blanks.filter((_, i) => i < 5).map((_, i) => <div key={`b${i}`} />)}
              {calDays.filter(day => !isWeekend(day)).map(day => {
                const key = format(day, 'yyyy-MM-dd')
                const pnl = calendarData[key]
                const { bg, color, glow } = calColor(pnl)
                return (
                  <div key={key} title={pnl !== undefined ? fmt(pnl) : ''} style={{
                    aspectRatio: '1', borderRadius: 8, background: bg, boxShadow: glow,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 5, cursor: pnl !== undefined ? 'pointer' : 'default',
                    border: pnl !== undefined ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border)',
                    padding: '6px 4px',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{format(day, 'd')}</span>
                    {pnl !== undefined
                      ? <span style={{ fontSize: 15, fontWeight: 700, color, lineHeight: 1 }}>{pnl >= 0 ? '+' : '-'}{Math.round(pnl)}</span>
                      : <span style={{ fontSize: 15, color: 'var(--muted2)' }}>—</span>
                    }
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Recent trades</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Instrument</span>
              {['ES','NQ','CL','GC','MES','MNQ','MCL','MGC'].map(inst => (
                <button key={inst} onClick={() => toggleArr(filterInstruments, setFilterInstruments, inst)}
                  className={filterInstruments.includes(inst) ? 'pill-active' : 'pill-inactive'}
                  style={{ padding: '3px 8px', fontSize: 13 }}>{inst}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Direction</span>
              {['long','short'].map(d => (
                <button key={d} onClick={() => setFilterDirection(prev => prev === d ? '' : d)}
                  className={filterDirection === d ? 'pill-active' : 'pill-inactive'}
                  style={{ padding: '3px 8px', fontSize: 13 }}>{d.toUpperCase()}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Setup</span>
              {['Breakout','Pullback','VWAP reclaim','Opening range','Trend follow','Reversal','News play'].map(tag => (
                <button key={tag} onClick={() => toggleArr(filterTags, setFilterTags, tag)}
                  className={filterTags.includes(tag) ? 'pill-active' : 'pill-inactive'}
                  style={{ padding: '3px 8px', fontSize: 13 }}>{tag}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Emotion</span>
              {['focused','confident','anxious','rushed','revenge_trading','fomo','neutral','tired'].map(e => (
                <button key={e} onClick={() => setFilterEmotion(prev => prev === e ? '' : e)}
                  className={filterEmotion === e ? 'pill-active' : 'pill-inactive'}
                  style={{ padding: '3px 8px', fontSize: 13 }}>{e.replace('_', ' ')}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 2 }}>Date range</span>
              <button onClick={() => setShowDateRange(p => !p)}
                className={showDateRange ? 'pill-active' : 'pill-inactive'}
                style={{ padding: '3px 8px', fontSize: 13 }}>{showDateRange ? 'HIDE' : 'SET RANGE'}</button>
              {showDateRange && (<>
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                  style={{ width: 130, fontSize: 13, padding: '3px 6px' }} />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>to</span>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                  style={{ width: 130, fontSize: 13, padding: '3px 6px' }} />
              </>)}
              {hasFilters && (
                <button onClick={clearFilters} style={{ marginLeft: 'auto', fontSize: 13, padding: '3px 10px', borderRadius: 4, border: '1px solid #2a0000', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
                  CLEAR ALL
                </button>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted2)', letterSpacing: '0.05em' }}>
                {hasFilters
                  ? `SHOWING ${tradeFiltered.length} OF ${filtered.length} TRADES · ${activeFilterLabel}`
                  : `${filtered.length} TRADES`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tradeFiltered.slice(0, 8).map((t, i) => (
                <div key={t.id} onClick={() => navigate(`/trade/${t.id}`)} style={{
                  display: 'grid', gridTemplateColumns: '44px 40px 1fr auto',
                  alignItems: 'center', gap: 8, padding: '7px 0',
                  borderBottom: i < Math.min(tradeFiltered.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{t.instrument}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: t.direction === 'long' ? 'var(--blue-text)' : 'var(--red-text)' }}>
                    {t.direction === 'long' ? 'LONG' : 'SHRT'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t.trade_date}</span>
                  <span className={t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'} style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                    {fmt(t.pnl)}
                  </span>
                </div>
              ))}
              {tradeFiltered.length === 0 && (
                <div style={{ fontSize: 15, color: 'var(--muted)', padding: '12px 0', textAlign: 'center', letterSpacing: '0.05em' }}>
                  NO TRADES MATCH THESE FILTERS
                </div>
              )}
            </div>
          </div>
        </div>
      </>)}
    </div>
  )
}