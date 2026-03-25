import { useEffect, useState } from 'react'

function formatCap(cap) {
  if (!cap) return '—'
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap}`
}

function formatVol(vol) {
  if (!vol) return '—'
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
  return vol
}

export default function StockMovers() {
  const [gainers, setGainers] = useState([])
  const [losers, setLosers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [view, setView] = useState('heatmap')

  async function fetchMovers() {
    setLoading(true)
    try {
      const res = await fetch('/api/movers')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGainers(data.gainers || [])
      setLosers(data.losers || [])
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovers()
    const interval = setInterval(fetchMovers, 120000)
    return () => clearInterval(interval)
  }, [])

  const allMovers = [
    ...gainers.map(s => ({ ...s, type: 'gainer' })),
    ...losers.map(s => ({ ...s, type: 'loser' })),
  ].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))

  function cardColor(pct) {
    const v = parseFloat(pct || 0)
    if (v >= 10)  return { bg: '#001e44', color: '#70c0ff', border: '#003080' }
    if (v >= 5)   return { bg: '#001228', color: '#4a90d9', border: '#002060' }
    if (v >= 2)   return { bg: '#000c1a', color: '#2060a0', border: '#001040' }
    if (v >= 0)   return { bg: '#050508', color: '#1a4070', border: '#0a1020' }
    if (v >= -2)  return { bg: '#140000', color: '#c04040', border: '#280000' }
    if (v >= -5)  return { bg: '#1e0000', color: '#e05050', border: '#3a0000' }
    if (v >= -10) return { bg: '#280000', color: '#ff6060', border: '#500000' }
    return           { bg: '#320000', color: '#ff8080', border: '#640000' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>
            Stock Movers
          </span>
          <div style={{ display: 'flex', background: '#0e0e0e', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
            {['heatmap', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontWeight: view === v ? 700 : 400,
                background: view === v ? '#1a1a2e' : 'transparent',
                color: view === v ? '#70c0ff' : '#666',
              }}>{v.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em' }}>UPDATED {lastUpdated}</span>}
          <button onClick={fetchMovers} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING MOVERS...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          ERROR: {error}
        </div>
      ) : view === 'heatmap' ? (
        <div style={{ flex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, overflow: 'hidden' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#70c0ff', letterSpacing: '0.1em', flexShrink: 0 }}>
              TOP GAINERS
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 6 }}>
              {gainers.slice(0, 20).map(stock => {
                const { bg, color, border } = cardColor(stock.changePct)
                return (
                  <div key={stock.symbol} style={{
                    background: bg, border: `1px solid ${border}`, borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 3,
                    boxShadow: `0 0 12px ${border}66`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0' }}>{stock.symbol}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color }}>{stock.changePct >= 0 ? '+' : ''}{stock.changePct?.toFixed(1)}%</div>
                    <div style={{ fontSize: 11, color: '#555' }}>${stock.price?.toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ff6060', letterSpacing: '0.1em', flexShrink: 0 }}>
              TOP LOSERS
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 6 }}>
              {losers.slice(0, 20).map(stock => {
                const { bg, color, border } = cardColor(stock.changePct)
                return (
                  <div key={stock.symbol} style={{
                    background: bg, border: `1px solid ${border}`, borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 3,
                    boxShadow: `0 0 12px ${border}66`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0' }}>{stock.symbol}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color }}>{stock.changePct >= 0 ? '+' : ''}{stock.changePct?.toFixed(1)}%</div>
                    <div style={{ fontSize: 11, color: '#555' }}>${stock.price?.toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 16px', overflow: 'hidden' }}>

          {[{ data: gainers, title: 'TOP GAINERS', titleColor: '#70c0ff' }, { data: losers, title: 'TOP LOSERS', titleColor: '#ff6060' }].map(({ data, title, titleColor }) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: titleColor, letterSpacing: '0.1em', marginBottom: 8, flexShrink: 0 }}>{title}</div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                      {['Symbol', 'Name', 'Price', 'Chg%', 'Volume', 'Mkt Cap'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', textAlign: h === 'Symbol' || h === 'Name' ? 'left' : 'right', fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((stock, i) => {
                      const { color } = cardColor(stock.changePct)
                      return (
                        <tr key={stock.symbol} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? 'transparent' : '#080808' }}>
                          <td style={{ padding: '7px 8px', fontWeight: 700, color: '#f0f0f0' }}>{stock.symbol}</td>
                          <td style={{ padding: '7px 8px', color: '#888', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</td>
                          <td style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>${stock.price?.toFixed(2)}</td>
                          <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color }}>{stock.changePct >= 0 ? '+' : ''}{stock.changePct?.toFixed(2)}%</td>
                          <td style={{ padding: '7px 8px', textAlign: 'right', color: '#666' }}>{formatVol(stock.volume)}</td>
                          <td style={{ padding: '7px 8px', textAlign: 'right', color: '#666' }}>{formatCap(stock.marketCap)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}