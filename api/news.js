export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch(
      'https://data.alpaca.markets/v1beta1/news?limit=50&sort=desc',
      {
        headers: {
          'APCA-API-KEY-ID': process.env.ALPACA_KEY,
          'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET,
        }
      }
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}