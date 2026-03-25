const FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business' },
  { url: 'https://feeds.reuters.com/reuters/topNews', label: 'Reuters Top News' },
  { url: 'https://feeds.reuters.com/Reuters/worldNews', label: 'Reuters World' },
  { url: 'https://feeds.reuters.com/reuters/USNewsHeadlines', label: 'Reuters US' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async feed => {
        const r = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        })
        const xml = await r.text()
        console.log(`${feed.label} status:`, r.status, 'length:', xml.length)

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
          const link = block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1] || ''
          const pubDate = get('pubDate')
          const guid = get('guid') || link

          if (title) {
            items.push({
              id: guid,
              headline: title,
              summary: description.replace(/<[^>]+>/g, '').trim(),
              source: feed.label,
              author: 'Reuters',
              url: link.trim(),
              created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            })
          }
        }
        return items
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
    res.status(200).json({ news: deduped, count: deduped.length })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ error: err.message, stack: err.stack })
  }
}