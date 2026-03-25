module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { headline, summary, source, category } = req.body

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 225,
        messages: [{
          role: 'user',
          content: `You are a market analyst for a futures trader (ES, NQ, CL, GC). Summarize in exactly 3 bullet points — what happened, market impact, what to watch. Be direct and specific. No fluff.\n\nSource: ${source}\nCategory: ${category}\nHeadline: ${headline}\nArticle: ${summary?.slice(0, 500) || 'N/A'}`
        }]
      })
    })
    const data = await response.json()
    res.status(200).json({ summary: data.content?.[0]?.text || 'Unable to generate summary.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}