export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60')

  const FEEDS = [
    { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business' },
    { url: 'https://feeds.reuters.com/reuters/topNews', label: 'Reuters Top News' },
    { url: 'https://feeds.reuters.com/Reuters/worldNews', label: 'Reuters World' },
    { url: 'https://feeds.reuters.com/reuters/USNewsHeadlines', label: 'Reuters US' },
  ]

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async feed => {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          }
        })
        const xml = await res.text()
        console.log(`${feed.label} status:`, res.status, 'length:', xml.length)

        const items = []
        const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
        for (const match of itemMatches) {
          const block = match[1]
          const get = (tag) => {
            const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
            return m ? (m[1] || m[2] || '').trim() : ''
          }
          const title = get('title')
          const description = get('description')
          const link = get('link') || block.match(/<link>\s*(.*?)\s*<\/link>/)?.[1] || ''
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
        console.log(`${feed.label}: parsed ${items.length} items`)
        return items
      })
    )

    const allItems = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      } else {
        console.log('Feed failed:', result.reason)
      }
    }

    const seen = new Set()
    const deduped = allItems.filter(a => {
      if (!a.headline || seen.has(a.headline)) return false
      seen.add(a.headline)
      return true
    })

    deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log('Total deduped items:', deduped.length)
    res.status(200).json({ news: deduped, count: deduped.length })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ error: err.message })
  }
}