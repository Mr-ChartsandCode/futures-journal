export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const HIGH_IMPACT_KEYWORDS = [
    'fomc', 'federal reserve', 'fed rate', 'interest rate decision',
    'cpi', 'inflation', 'consumer price',
    'nonfarm', 'non-farm', 'jobs report', 'unemployment',
    'gdp', 'gross domestic',
    'pmi', 'ism', 'purchasing managers',
    'retail sales', 'consumer spending',
    'housing starts', 'existing home', 'new home sales',
    'pce', 'personal consumption',
    'powell', 'fed chair', 'fed minutes', 'fomc minutes',
    'trade balance', 'current account',
    'durable goods', 'industrial production',
    'consumer confidence', 'consumer sentiment',
  ]

  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
    })
    const weekData = await r.json()

    // Also try next week
    const r2 = await fetch('https://nfs.faireconomy.media/ff_calendar_nextweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).catch(() => null)
    const nextWeekData = r2 ? await r2.json().catch(() => []) : []

    const allEvents = [...(Array.isArray(weekData) ? weekData : []), ...(Array.isArray(nextWeekData) ? nextWeekData : [])]

    const filtered = allEvents
      .filter(e => e.country === 'USD')
      .filter(e => {
        const title = e.title?.toLowerCase() || ''
        const isHighImpact = e.impact === 'High' || e.impact === 'Medium'
        const isKeyword = HIGH_IMPACT_KEYWORDS.some(k => title.includes(k))
        return isHighImpact || isKeyword
      })
      .map(e => ({
        title: e.title,
        date: e.date,
        impact: e.impact,
        forecast: e.forecast || null,
        previous: e.previous || null,
        actual: e.actual || null,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.status(200).json({ events: filtered, count: filtered.count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}