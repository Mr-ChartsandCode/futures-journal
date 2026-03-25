export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const r = await fetch('https://financialmodelingprep.com/api/v3/sectors-performance?apikey=demo')
    const data = await r.json()
    res.status(200).json({ status: r.status, data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}