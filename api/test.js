export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const results = await Promise.allSettled([
      fetch('https://economic-calendar.tradingview.com/events?from=2026-03-25&to=2026-04-25&countries=US', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
      }),
      fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }),
      fetch('https://nfs.faireconomy.media/ff_calendar_thismonth.json', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }),
    ])

    const responses = await Promise.all(
      results.map(async r => {
        if (r.status !== 'fulfilled') return { error: r.reason?.message }
        const text = await r.value.text()
        return { status: r.value.status, length: text.length, preview: text.slice(0, 200) }
      })
    )

    res.status(200).json(responses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}