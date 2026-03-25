export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const response = await fetch('https://feeds.reuters.com/reuters/businessNews', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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