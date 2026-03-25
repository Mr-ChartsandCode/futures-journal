import { useEffect, useState } from 'react'

const PERIODS = ['1D', '5D', '1M', '3M', 'YTD']

function heatColor(change) {
  if (change === null) return { bg: '#111', color: '#444', border: '#222' }
  const v = parseFloat(change)
  if (v >= 3)   return { bg: '#001e44', color: '#70c0ff', border: '#003080' }
  if (v >= 1.5) return { bg: '#001228', color: '#4a90d9', border: '#002060' }
  if (v >= 0.5) return { bg: '#000c1a', color: '#2060a0', border: '#001040' }
  if (v >= 0)   return { bg: '#050508', color: '#1a4070', border: '#0a1020' }
  if (v >= -0.5) return { bg: '#0a0000', color: '#803030', border: '#1a0000' }
  if (v >= -1.5) return { bg: '#140000', color: '#c04040', border: '#280000' }
  if (v >= -3)   return { bg: '#1e0000', color: '#e05050', border: '#3a0000' }
  return           { bg: '#280000', color: '#ff6060', border: '#500000' }
}

export default function SectorHeatmap() {
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('1D')
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function fetchSectors(p) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sectors?range=${p}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSectors(data.sectors || [])
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSectors(period)
    const interval = setInterval(() => fetchSectors(period), 300000)
    return () => clearInterval(interval)
  }, [period])

  const sorted = [...sectors].sort((a, b) => {
    if (a.change === null) return 1
    if (b.change === null) return -1
    return parseFloat(b.change) - parseFloat(a.change)
  })

  const maxAbs = Math.max(...sectors.map(s => Math.abs(parseFloat(s.change || 0))))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>
            Sector Heatmap
          </span>
          <div style={{ display: 'flex', background: '#0e0e0e', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontWeight: period === p ? 700 : 400,
                background: period === p ? '#1a1a2e' : 'transparent',
                color: period === p ? '#70c0ff' : '#666',
                transition: 'all 0.15s',
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em' }}>UPDATED {lastUpdated}</span>}
          <button onClick={() => fetchSectors(period)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING SECTOR DATA...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          ERROR: {error}
        </div>
      ) : (
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 20 }}>
            {sorted.map(sector => {
              const { bg, color, border } = heatColor(sector.change)
              const abs = Math.abs(parseFloat(sector.change || 0))
              const intensity = maxAbs > 0 ? abs / maxAbs : 0
              const size = 80 + intensity * 60
              return (
                <div key={sector.symbol} style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  padding: `${size * 0.18}px 16px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: parseFloat(sector.change || 0) !== 0 ? `0 0 20px ${border}66` : 'none',
                  transition: 'all 0.3s',
                  minHeight: `${size}px`,
                }}>
                  <div style={{ fontSize: 11, color: '#666', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {sector.symbol}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', textAlign: 'center' }}>
                    {sector.name}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em' }}>
                    {sector.change !== null
                      ? `${parseFloat(sector.change) >= 0 ? '+' : ''}${sector.change}%`
                      : '—'}
                  </div>
                  {sector.price && (
                    <div style={{ fontSize: 11, color: '#555' }}>
                      ${sector.price}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em' }}>SCALE:</span>
            {['-3%+', '-1.5%', '-0.5%', '0%', '+0.5%', '+1.5%', '+3%+'].map((label, i) => {
              const colors = ['#ff6060','#e05050','#c04040','#444','#2060a0','#4a90d9','#70c0ff']
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i] }} />
                  <span style={{ fontSize: 9, color: '#444' }}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}