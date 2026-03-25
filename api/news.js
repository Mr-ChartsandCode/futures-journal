const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='

const FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters Business' },
  { url: 'https://feeds.reuters.com/reuters/topNews', label: 'Reuters Top News' },
  { url: 'https://feeds.reuters.com/Reuters/worldNews', label: 'Reuters World' },
  { url: 'https://feeds.reuters.com/reuters/USNewsHeadlines', label: 'Reuters US' },
  { url: 'https://feeds.reuters.com/reuters/technologyNews', label: 'Reuters Tech' },
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60')

  try {
    const results = await Promise.allSettled(
      FEEDS.map(feed =>
        fetch(`${RSS2JSON}${encodeURIComponent(feed.url)}&count=20`)
          .then(r => r.json())
          .then(data => ({ items: data.items || [], label: feed.label }))
      )
    )

    const allItems = []

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      const { items, label } = result.value
      for (const item of items) {
        const text = (item.title + ' ' + (item.description || '')).replace(/<[^>]+>/g, '')
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
    }

    const seen = new Set()
    const deduped = allItems.filter(a => {
      if (!a.headline || seen.has(a.headline)) return false
      seen.add(a.headline)
      return true
    })

    deduped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.status(200).json({ news: deduped })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}