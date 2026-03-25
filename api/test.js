export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  try {
    const response = await fetch('https://feeds.reuters.com/reuters/businessNews', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      }
    })
    
    const text = await response.text()
    res.status(200).json({ 
      status: response.status,
      length: text.length,
      preview: text.slice(0, 500)
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}