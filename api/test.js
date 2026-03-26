export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await r.json()
    const withActuals = data.filter(e => e.actual && e.actual !== '')
    const withoutActuals = data.filter(e => (!e.actual || e.actual === '') && new Date(e.date) < new Date())
    res.status(200).json({
      totalEvents: data.length,
      eventsWithActuals: withActuals.length,
      pastEventsWithNoActual: withoutActuals.length,
      sampleWithActual: withActuals.slice(0, 3),
      sampleMissingActual: withoutActuals.slice(0, 3),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}