export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { headline, summary, source, category } = req.body || {}

  if (!headline) return res.status(400).json({ error: 'No headline provided' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 225,
        messages: [{
          role: 'user',
          content: `You are a market analyst for a futures trader (ES, NQ, CL, GC). Summarize in exactly 3 bullet points — what happened, market impact, what to watch. Be direct and specific. No fluff.\n\nSource: ${source}\nCategory: ${category}\nHeadline: ${headline}\nArticle: ${summary?.slice(0, 500) || 'N/A'}`
        }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return res.status(200).json({ summary: null })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || null
    res.status(200).json({ summary: text })
  } catch (err) {
    console.error('Summarize error:', err.message)
    res.status(200).json({ summary: null })
  }
}