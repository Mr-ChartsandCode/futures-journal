export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sources = [
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://feeds.reuters.com/reuters/topNews',
    'https://apnews.com/rss',
  ]

  const results = await Promise.allSettled(
    sources.map(async url => {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(8000),
      })
      const text = await r.text()
      return { url, status: r.status, length: text.length, preview: text.slice(0, 150) }
    })
  )

  res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }))
}