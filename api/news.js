const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', label: 'BBC Business' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', label: 'BBC World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', label: 'NYT Business' },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', label: 'WSJ Markets' },
  { url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', label: 'WSJ World' },
  { url: 'https://feeds.a.dj.com/rss/RSSWSJD.xml', label: 'WSJ' },
  { url: 'https://www.ft.com/rss/home', label: 'Financial Times' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=90')

  const results = await Promise.allSettled(
    FEEDS.map(async feed => {
      try {
        const r = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
          },
          signal: AbortSignal.timeout(8000),
        })

        if (!r.ok) {
          console.log(`${feed.label} returned ${r.status}`)
          return []
        }

        const xml = await r.text()
        console.log(`${feed.label}: ${r.status}, ${xml.length} chars`)

        const items = []
        const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

        for (const match of itemMatches) {
          const block = match[1]
          const get = (tag) => {
            const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
            return m ? (m[1] || m[2] || '').trim() : ''
          }
          const title = get('title')
          const description = get('description')
          const link = block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1]?.trim() || get('link')
          const pubDate = get('pubDate')
          const guid = get('guid') || link

          if (title) {
            items.push({
              id: guid,
              headline: title,
              summary: description.replace(/<[^>]+>/g, '').trim(),
              source: feed.label,
              author: feed.label,
              url: link,
              created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            })
          }
        }
        return items
      } catch (err) {
        console.log(`${feed.label} failed:`, err.message)
        return []
      }
    })
  )

  const allItems = []
  for (const result of results) {
    if (result.status === 'fulfilled') allItems.push(...result.value)
  }

  const seen = new Set()
  const deduped = allItems.filter(a => {
    if (!a.headline || seen.has(a.headline)) return false
    seen.add(a.headline)
    return true
  })

  deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  console.log('Total articles:', deduped.length)
  res.status(200).json({ news: deduped, count: deduped.length })
}