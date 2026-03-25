export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const url = `https://financialmodelingprep.com/api/v3/sectors-performance?apikey=${process.env.FMP_API_KEY}`
    const r = await fetch(url)
    const data = await r.json()
    res.status(200).json({ status: r.status, data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}