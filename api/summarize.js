export default async function handler(req, res) {
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
        model: 'claude-opus-4-20250514',
        max_tokens: 300,
        system: `You are a concise market analyst for a professional futures trader who trades ES, NQ, CL and GC. 
Your job is to summarize news in exactly 3 bullet points focused purely on market impact.
Format: 
- [What happened]
- [Direct market impact — which instruments, which direction, why]  
- [What to watch — key levels, follow-on events, risks]
Be direct, specific, no fluff. If the news has no clear market impact say so in one line.`,
        messages: [{
          role: 'user',
          content: `Summarize this news for a futures trader:\n\nSource: ${source}\nCategory: ${category}\nHeadline: ${headline}\n\nArticle: ${summary || 'No article body available.'}`
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || 'Unable to generate summary.'
    res.status(200).json({ summary: text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}