import { useEffect, useState } from 'react'

function impactColor(impact) {
  switch (impact) {
    case 'High':   return { color: '#ff4444', bg: '#1a0000', border: '#600000' }
    case 'Medium': return { color: '#ffaa40', bg: '#1a0e00', border: '#604000' }
    case 'Low':    return { color: '#555',    bg: '#111',    border: '#222'    }
    default:       return { color: '#555',    bg: '#111',    border: '#222'    }
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })
}

function groupByDate(events) {
  const groups = {}
  events.forEach(e => {
    const key = new Date(e.date).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return groups
}

function countryBadge(country) {
  const colors = {
    USD: '#70c0ff', EUR: '#a0d0ff', GBP: '#80b8ff',
    JPY: '#ffaa40', CAD: '#ff8844', AUD: '#ffcc44',
    CNY: '#ff6060', CNH: '#ff6060', INR: '#ff9944',
    BRL: '#44cc88', KRW: '#44aaff', MXN: '#88dd44',
    CHF: '#ff4444', SGD: '#44ddaa',
  }
  const color = colors[country] || '#888'
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      background: `${color}22`, color, border: `1px solid ${color}44`,
      letterSpacing: '0.06em', marginRight: 6, flexShrink: 0,
    }}>{country}</span>
  )
}

export default function EconCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)

  async function fetchCalendar() {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setEvents(data.events || [])
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendar()
  }, [])

  const filtered = filter === 'All'
    ? events
    : events.filter(e => e.impact === filter)

  const grouped = groupByDate(filtered)
  const today = new Date().toDateString()
  const tomorrow = new Date(Date.now() + 86400000).toDateString()

  function dayLabel(dateStr) {
    if (dateStr === today) return 'TODAY'
    if (dateStr === tomorrow) return 'TOMORROW'
    return formatDate(dateStr).toUpperCase()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>
            Econ Calendar
          </span>
          <div style={{ display: 'flex', background: '#0e0e0e', border: '1px solid var(--border)', borderRadius: 6, padding: 3, gap: 2 }}>
            {['All', 'High', 'Medium'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontWeight: filter === f ? 700 : 400,
                background: filter === f ? '#1a1a1a' : 'transparent',
                color: filter === f
                  ? f === 'High' ? '#ff4444' : f === 'Medium' ? '#ffaa40' : '#f0f0f0'
                  : '#555',
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em' }}>UPDATED {lastUpdated}</span>}
          <button onClick={fetchCalendar} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.05em' }}>
            ↻ REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING CALENDAR...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          ERROR: {error}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.keys(grouped).length === 0 && (
            <div style={{ padding: 24, color: '#555', fontSize: 12, textAlign: 'center', letterSpacing: '0.05em' }}>
              NO EVENTS FOUND
            </div>
          )}
          {Object.entries(grouped).map(([dateStr, dayEvents]) => (
            <div key={dateStr}>
              <div style={{
                padding: '8px 20px',
                background: dateStr === today ? '#001428' : '#080808',
                borderBottom: '1px solid #1a1a1a',
                borderTop: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: dateStr === today ? '#70c0ff' : '#444', letterSpacing: '0.1em' }}>
                  {dayLabel(dateStr)}
                </span>
                <span style={{ fontSize: 10, color: '#333' }}>{dayEvents.length} EVENTS</span>
              </div>

              {dayEvents.map((event, i) => {
                const { color, bg, border } = impactColor(event.impact)
                const isPast = new Date(event.date) < new Date() && event.actual
                return (
                  <div key={i} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #111',
                    display: 'grid',
                    gridTemplateColumns: '80px 16px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    background: isPast ? '#050505' : 'transparent',
                    opacity: isPast ? 0.6 : 1,
                  }}>
                    <span style={{ fontSize: 16, color: '#555', letterSpacing: '0.03em' }}>
                      {formatTime(event.date)}
                    </span>

                    <div style={{ width: 4, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />

                    <div>
                      <div style={{ fontSize: 18, fontWeight: 500, color: '#ffffff', marginBottom: 3, display: 'flex', alignItems: 'center' }}>
                      {countryBadge(event.country)}{event.title}
                    </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                        {event.forecast && (
                          <span style={{ color: '#555', fontSize: 14 }}>Forecast: <span style={{ color: '#888' }}>{event.forecast}</span></span>
                        )}
                        {event.previous && (
                          <span style={{ color: '#555', fontSize: 14 }}>Previous: <span style={{ color: '#888' }}>{event.previous}</span></span>
                        )}
                        {event.actual && (
                          <span style={{ color: '#555', fontSize: 14 }}>Actual: <span style={{ color: '#70c0ff', fontWeight: 700 }}>{event.actual}</span></span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: 13, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.06em', flexShrink: 0 }}>
                      {event.impact?.toUpperCase()}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}