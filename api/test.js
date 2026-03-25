export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sources = [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    'https://www.ft.com/rss/home',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  ]

  const results = await Promise.allSettled(
    sources.map(async url => {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0' },
        signal: AbortSignal.timeout(8000),
      })
      const text = await r.text()
      return { url, status: r.status, length: text.length, preview: text.slice(0, 100) }
    })
  )

  res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
}