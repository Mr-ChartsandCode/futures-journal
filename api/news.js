const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='

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
        const url = `${RSS2JSON}${encodeURIComponent(feed.url)}&count=20`
        console.log('Fetching:', url)
        const r = await fetch(url)
        const text = await r.text()
        console.log('Response status:', r.status, 'for', feed.label)
        console.log('Response preview:', text.slice(0, 200))
        const data = JSON.parse(text)
        return { items: data.items || [], label: feed.label }
      })
    )

    const allItems = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { items, label } = result.value
        console.log(`${label}: ${items.length} items`)
        for (const item of items) {
          allItems.push({
            id: item.guid || item.link,
            headline: item.title?.trim(),
            summary: item.description?.replace(/<[^>]+>/g, '').trim(),
            source: label,
            author: item.author || 'Reuters',
            url: item.link,
            created_at: item.pubDate,
          })
        }
      } else {
        console.log('Feed failed:', result.reason)
      }
    }

    console.log('Total items before dedup:', allItems.length)

    const seen = new Set()
    const deduped = allItems.filter(a => {
      if (!a.headline || seen.has(a.headline)) return false
      seen.add(a.headline)
      return true
    })

    deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.status(200).json({ news: deduped, count: deduped.length })
  } catch (err) {
    console.error('Handler error:', err)
    res.status(500).json({ error: err.message, stack: err.stack })
  }
}