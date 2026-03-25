export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ 
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 10) || 'NOT FOUND'
  })
}