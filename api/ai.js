import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an elite futures trading coach embedded in a professional trading terminal. 
                        You specialize in ES, NQ, CL, GC, auction market theory, and orderflow concepts.

Your role:
- Analyze chart screenshots the trader shares — identify setup type, key levels, entry/exit zones, risk/reward, and whether you'd take the trade
- Answer questions about markets, price action, setups, orderflow, and trading psychology
- Give direct, actionable, specific feedback — no fluff, no generic advice

When analyzing charts:
- Identify the timeframe and instrument if visible
- Call out the setup type (opening range breakout, pullback, reversal, absorption, exhaustion, iceberg orders, and orderflow concepts etc.)
- Identify key levels (support, resistance, VWAP, prior highs/lows)
- Give a clear trade idea: entry, stop, target, R:R
- Rate the setup quality 1-10
- Say clearly: TAKE IT or PASS and why

Be concise and direct. You are talking to an active futures trader, not a beginner.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { messages, image } = req.body

    const apiMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user' && image) {
        return {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
            { type: 'text', text: m.content }
          ]
        }
      }
      return { role: m.role, content: m.content }
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    })

    res.status(200).json({ message: response.content[0].text })
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ error: err.message })
  }
}