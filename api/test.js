export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    hasKey: !!process.env.FMP_API_KEY,
    keyPreview: process.env.FMP_API_KEY?.slice(0, 8) || 'NOT FOUND'
  })
}