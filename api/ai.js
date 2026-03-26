import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const SYSTEM_PROMPT = `You are an elite futures trading coach and analyst embedded inside a professional trading terminal. You have deep expertise in ES, NQ, CL, GC and their micro contracts.

You have access to the trader's complete trade history, performance analytics, and live market context. Your role is to:
- Identify patterns in their trading that are costing or making them money
- Score and critique their setups with brutal honesty
- Give actionable, specific feedback — not generic advice
- Analyze chart screenshots they share using your vision capabilities
- Provide daily briefings that synthesize their performance with current market conditions

When analyzing charts: identify the setup type, key levels, potential entry/exit, risk/reward, and whether you'd take the trade.
When analyzing trades: look for patterns in time of day, instrument, emotion, setup, and outcome.
When scoring setups: use a 1-10 score across: entry quality, stop placement, target selection, and overall R:R.

Be direct, concise, and trading-focused. No fluff.`

async function fetchTradeContext(userId) {
  try {
    const { data: trades } = await supabase
      .from('trades')
      .select('*, trade_tags(tags(name))')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false })
      .limit(50)

    if (!trades?.length) return 'No trades found in journal.'

    const wins = trades.filter(t => t.pnl > 0)
    const losses = trades.filter(t => t.pnl < 0)
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
    const winRate = ((wins.length / trades.length) * 100).toFixed(1)
    const avgWin = wins.length ? (wins.reduce((s,t) => s+t.pnl,0)/wins.length).toFixed(2) : 0
    const avgLoss = losses.length ? (losses.reduce((s,t) => s+t.pnl,0)/losses.length).toFixed(2) : 0
    const grossWin = wins.reduce((s,t) => s+t.pnl,0)
    const grossLoss = Math.abs(losses.reduce((s,t) => s+t.pnl,0))
    const pf = grossLoss > 0 ? (grossWin/grossLoss).toFixed(2) : '∞'

    const setupMap = {}
    trades.forEach(t => {
      const tag = t.trade_tags?.[0]?.tags?.name || 'Untagged'
      if (!setupMap[tag]) setupMap[tag] = { pnl: 0, trades: 0, wins: 0 }
      setupMap[tag].pnl += t.pnl
      setupMap[tag].trades++
      if (t.pnl > 0) setupMap[tag].wins++
    })

    const setupSummary = Object.entries(setupMap)
      .sort((a,b) => b[1].pnl - a[1].pnl)
      .map(([name, s]) => `${name}: ${s.trades} trades, ${((s.wins/s.trades)*100).toFixed(0)}% WR, $${s.pnl.toFixed(0)} PnL`)
      .join('\n')

    const recentTrades = trades.slice(0, 10).map(t => {
      const tags = t.trade_tags?.map(tt => tt.tags?.name).filter(Boolean).join(', ') || 'none'
      return `${t.trade_date} | ${t.instrument} ${t.direction?.toUpperCase()} | $${t.pnl} | ${tags} | ${t.emotion || 'N/A'}`
    }).join('\n')

    return `
TRADER PERFORMANCE SUMMARY (last ${trades.length} trades):
- Total P&L: $${totalPnl.toFixed(2)}
- Win Rate: ${winRate}%
- Avg Winner: $${avgWin} | Avg Loser: $${avgLoss}
- Profit Factor: ${pf}

SETUP BREAKDOWN:
${setupSummary}

RECENT TRADES (last 10):
${recentTrades}
`
  } catch (err) {
    return `Could not load trade data: ${err.message}`
  }
}

async function fetchNewsContext() {
  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const events = await r.json()
    const now = new Date()
    const upcoming = events
      .filter(e => e.country === 'USD' && e.impact === 'High' && new Date(e.date) > now)
      .slice(0, 5)
      .map(e => `${e.date} — ${e.title}${e.forecast ? ` (Forecast: ${e.forecast})` : ''}`)
      .join('\n')
    return upcoming ? `UPCOMING HIGH IMPACT EVENTS:\n${upcoming}` : ''
  } catch { return '' }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { messages, userId, includeTradeContext, includeNewsContext, image } = req.body

    let contextBlock = ''
    if (includeTradeContext && userId) {
      contextBlock += await fetchTradeContext(userId)
    }
    if (includeNewsContext) {
      const news = await fetchNewsContext()
      if (news) contextBlock += '\n\n' + news
    }

    const systemWithContext = contextBlock
      ? `${SYSTEM_PROMPT}\n\n--- LIVE CONTEXT ---\n${contextBlock}`
      : SYSTEM_PROMPT

    // Build messages — add image to last user message if provided
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
      max_tokens: 1024,
      system: systemWithContext,
      messages: apiMessages,
    })

    res.status(200).json({
      message: response.content[0].text,
      usage: response.usage,
    })
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ error: err.message })
  }
}