export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sources = [
    'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://www.cnbc.com/id/10001147/device/rss/rss.html',
    'https://apnews.com/apf-business',
    'https://apnews.com/apf-topnews',
    'https://rsshub.app/apnews/topics/business',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    'https://news.google.com/rss/search?q=market+news+when:1d&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlBQVAB',
  ]

  const results = await Promise.allSettled(
    sources.map(async url => {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(8000),
      })
      const text = await r.text()
      const isXml = text.trim().startsWith('<?xml') || text.trim().startsWith('<rss')
      return { url, status: r.status, length: text.length, isXml, preview: text.slice(0, 80) }
    })
  )

  res.status(200).json(results.map(r => r.status === 'fulfilled' ? r.value : { url: r.reason?.message, error: true }))
}