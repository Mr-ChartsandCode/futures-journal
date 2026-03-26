const G20_CURRENCIES = new Set([
  'USD','EUR','GBP','JPY','CAD','AUD','CNY','CNH','INR','BRL',
  'KRW','MXN','RUB','ZAR','TRY','SAR','ARS','IDR','CHF','SGD'
])

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }),
      fetch('https://nfs.faireconomy.media/ff_calendar_nextweek.json', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).catch(() => null)
    ])

    const thisWeek = await r1.json().catch(() => [])
    const nextWeek = r2 ? await r2.json().catch(() => []) : []
    const allEvents = [
      ...(Array.isArray(thisWeek) ? thisWeek : []),
      ...(Array.isArray(nextWeek) ? nextWeek : [])
    ]

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const filtered = allEvents
      .filter(e => G20_CURRENCIES.has(e.country))
      .filter(e => e.impact === 'High' || e.impact === 'Medium')
      .filter(e => new Date(e.date) >= todayStart)
      .map(e => ({
        title: e.title,
        country: e.country,
        date: e.date,
        impact: e.impact,
        forecast: e.forecast || null,
        previous: e.previous || null,
        actual: e.actual || null,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.status(200).json({ events: filtered, count: filtered.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}