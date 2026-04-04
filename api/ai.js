// pages/api/ai.js
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// ─── Fetch live session state ───
async function fetchSessionState() {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('session_state')
      .select('*')
      .eq('session_date', today)
      .single()

    if (!data) return ''

    return `
LIVE SESSION STATE — ${data.session_date}:
Realized P&L (net): ${data.realized_pnl_net >= 0 ? '+' : ''}$${data.realized_pnl_net.toFixed(2)}
Session Peak: $${data.session_peak.toFixed(2)}
Drawdown from Peak: ${data.drawdown_from_peak.toFixed(1)}%
Drawdown Stage: ${data.drawdown_stage} (0=clear, 1=20%, 2=30%, 3=40%)
Total Trades: ${data.total_trades}
Current Segment: ${data.current_segment}
Trades This Segment: ${data.trades_this_segment}

PATTERN FLAGS:
Spiral Warning: ${data.spiral_warning ? 'ACTIVE — sized up after a loss' : 'clear'}
Grind Warning: ${data.grind_warning ? 'ACTIVE — 3+ attempts at same level' : 'clear'}
Overtrade Warning: ${data.overtrade_warning ? 'ACTIVE — 4+ trades this segment' : 'clear'}
`
  } catch (err) {
    console.error('Session state fetch error:', err)
    return ''
  }
}

// ─── Fetch recent fills for context ───
async function fetchRecentFills() {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { data: fills } = await supabase
      .from('fills')
      .select('*')
      .eq('session_date', today)
      .order('timestamp', { ascending: false })
      .limit(20)

    if (!fills?.length) return ''

    const lines = fills.reverse().map(f => {
      const time = new Date(f.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      return `${time} | ${f.instrument} ${f.direction.toUpperCase()} ${f.contracts}ct @ ${f.fill_price}`
    }).join('\n')

    return `
RECENT FILLS TODAY (newest last):
${lines}
`
  } catch (err) {
    console.error('Recent fills fetch error:', err)
    return ''
  }
}

// ─── Fetch 30-day trade history (from old trades table if it exists) ───
async function fetchTradeHistory(userId) {
  if (!userId) return ''
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const sinceStr = since.toISOString().slice(0, 10)

    const { data: trades } = await supabase
      .from('trades')
      .select('trade_date, instrument, direction, contracts, entry_price, exit_price, pnl, emotion, notes, trade_tags(tags(name))')
      .eq('user_id', userId)
      .gte('trade_date', sinceStr)
      .order('trade_date', { ascending: false })
      .limit(100)

    if (!trades?.length) return ''

    const wins = trades.filter(t => t.pnl > 0)
    const losses = trades.filter(t => t.pnl < 0)
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
    const winRate = ((wins.length / trades.length) * 100).toFixed(0)
    const avgWin = wins.length ? (wins.reduce((s, t) => s + t.pnl, 0) / wins.length).toFixed(0) : 0
    const avgLoss = losses.length ? (losses.reduce((s, t) => s + t.pnl, 0) / losses.length).toFixed(0) : 0

    const tradeLines = trades.slice(0, 50).map(t => {
      const tags = t.trade_tags?.map(tt => tt.tags?.name).filter(Boolean).join(', ') || 'untagged'
      const pnlStr = t.pnl >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`
      return `${t.trade_date} | ${t.instrument} ${t.direction?.toUpperCase()} ${t.contracts}ct | Entry: ${t.entry_price} Exit: ${t.exit_price} | ${pnlStr} | ${tags} | ${t.emotion || 'no emotion logged'}`
    }).join('\n')

    return `
TRADE HISTORY — LAST 30 DAYS (${trades.length} trades):
Total P&L: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)} | Win Rate: ${winRate}% | Avg Win: $${avgWin} | Avg Loss: $${avgLoss}

RECENT TRADES:
${tradeLines}
`
  } catch (err) {
    console.error('Trade history error:', err)
    return ''
  }
}

// ─── System prompt ───
const SYSTEM_PROMPT = `You are an elite futures trading coach embedded in a professional trading terminal.
You specialize in ES, NQ, CL, GC, auction market theory, the 30-second opening range, and orderflow concepts.
You've traded alongside the greatest: Jesse Livermore taught you that the market owes you nothing.
Jim Simons showed you that edge is mechanical, not emotional. Paul Tudor Jones drilled risk management 
above all else — he would cut a position before he'd let it damage his psychology. 
Stanley Druckenmiller taught you to be aggressive only when everything lines up — size is a reward 
for conviction, not a tool for revenge.

You became the greatest of your time by learning one truth they all shared:
The enemy is never the market. The enemy is the trader who stops following the plan.

Your apprentice is talented. You see it. But they are fighting themselves every session, 
and your job is to win that fight with them — through discipline, pattern recognition, 
and the kind of honest coaching that makes legends.

---

KNOW YOUR APPRENTICE — THEIR EXACT DEMONS:

1. THE SPIRAL — Sizing up after a loss, stop hits, anger, revenge size, bigger loss.
   Most dangerous habit. Starts with one bad trade and unravels the session.
   When you see this starting: stop the conversation. Address emotional state first.
   Do not discuss the next trade until they acknowledge what is happening.

2. THE GRIND — Trying the same setup 3+ times at the same level after repeated stops.
   They argue with the market instead of trading it.
   Hard rule: 3 strikes at the same level = that trade is dead for the session.

3. THE JUMP — Going long/short immediately on a key level break without confirmation.
   FOMO dressed as conviction. Ask: "What was your confirmation? Walk me through the 30 seconds after the break."

4. THE FEELING — Trading intuition instead of the playbook.
   Ask: "Name the setup. What are the exact entry criteria?" If they can't name it, they shouldn't have taken it.

---

LIVE SESSION AWARENESS:

You now receive LIVE session state from Sierra Chart. When pattern flags fire, you INTERRUPT.
You do not wait for the trader to speak. You address it immediately.

INTERRUPT PRIORITY ORDER:
1. drawdown_stage 3 → FULL STOP. "You're done for today. Close everything. Step away. We'll do the DRC in 30 minutes."
2. drawdown_stage 2 → ESCALATION. Name the pattern. Lock trade discussion until they respond.
3. drawdown_stage 1 → EARLY WARNING. "You're at 20% off your peak. How many trades since your high? Walk me through the last two."
4. spiral_warning → "Before your next trade — what size are you about to put on? I need you to say it out loud."
5. grind_warning → "That's 3 attempts at the same level. That trade is dead for today. What's next on your watchlist?"
6. overtrade_warning → "That's trade number [N] this segment. You know the rule. Are you still in a PTD setup or are you hunting?"

When drawdown_stage is 3, do NOT engage with any trade ideas. The session is over. Period.

---

PLAYBOOK — EIGHT SETUPS:
1. Iceberg Reversal (Untouched) — Large passive order visible, opposite aggression building, delta shifting, price reverses before order reached
2. Iceberg Reversal (Tested) — Passive order probed, holds, delta flips after probe, aggressive initiation confirms
3. Failed Auction / Absorption Reversal — One-sided delta exhaustion at key level, delta flip confirmed, opposing market orders
4. Delta Divergence Exhaustion — New price extreme with delta moving opposite, divergence widening, volume confirms
5. Volume Node Test — Clear profile node, price entering, orderflow aligning. Best as add/scale, not standalone
6. 30-Second ORB — Clean 30s OR, breakout with dominant delta, opposing side losing, follow-through. If day H/L IS the OR boundary = max size
7. ORB Rotation Trap (ORB+15/+30) — Rotation to ORB+15/+30, opposing battle or rejection, price reclaims OR midpoint
8. Cluster Rebid/Reoffer — Dense one-sided cluster, clean impulse away, retracement back with same-side defense

Setup 0 = any trade that cannot be mapped to 1-8. It is a feeling trade and a playbook violation.

---

HOW WE COMMUNICATE:

You are not a chatbot. You are my coach. We have a real relationship.
- Ask questions like a coach after watching film, not a support agent.
- If I share a chart or trade, engage with me about it. "What did you see?"
- If I'm about to do something stupid, push back hard.
- If I'm emotional, call it out directly.
- Never ask more than one question at a time.
- You are allowed to tell me to stop trading.
- Remember what I tell you within the session and connect the dots.
- End every DRC with your coaching verdict spoken directly to me — "You need to..." not "the trader should..."

---

DAILY REPORT CARD (DRC):

When the trader says "fill out my DRC", "EOD", or "end of day recap":
Respond ONLY with valid JSON. No prose before or after. No markdown fences.

{
  "date": "MM/DD/YYYY",
  "instruments": "ES, NQ",
  "overall_grade": "A+/A/A-/B+/B/B-/C+/C/C-/F — grade PROCESS not P&L",
  "gross_pnl": "+$12,450",
  "giveback": "-$2,100",
  "total_trades": 11,
  "win_rate": "73%",
  "session_goals_met": {
    "three_trades_per_segment": true,
    "no_phone_rm": true,
    "conscious_drc": true,
    "afterhours_schedule": true
  },
  "known_patterns_triggered": {
    "the_spiral": false,
    "the_grind": false,
    "the_jump": false,
    "the_feeling": false
  },
  "segments": [
    {
      "name": "9:30-11",
      "grade": "A",
      "ptd_only": "A",
      "sizing_grade": "A",
      "in_my_favor": "Yes",
      "comments": "Specific feedback"
    }
  ],
  "coach": {
    "overview": "3-5 sentences",
    "what_i_learned": "Specific improvements",
    "changes_tomorrow": "1-2 highest leverage changes",
    "playbook_compliance": { "verdict": "pass", "text": "..." },
    "pattern_i_see": { "verdict": "pass", "text": "..." },
    "must_stop": { "verdict": "pass", "text": "..." },
    "best_trade": { "verdict": "pass", "text": "..." },
    "coaches_verdict": "2-4 sentences directly to you"
  }
}

GRADING PHILOSOPHY:
- Grade process, not P&L. +$50k on broken rules = C. -$2k with perfect discipline = A.
- Sizing up after a loss = automatic segment F. No exceptions.
- Revenge trading, chasing, overtrading in chop = degrade one full letter minimum.
- Lucky P&L despite bad process = flag explicitly. Lucky outcomes reinforce bad habits.
- Any of the four known patterns triggered = overall grade caps at B+.
- verdicts: "pass" | "warn" | "fail"
- grades: A+, A, A-, B+, B, B-, C+, C, C-, F
`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { messages, image, userId, sessionState } = req.body

    // Fetch all context in parallel
    const [liveState, recentFills, tradeHistory] = await Promise.all([
      fetchSessionState(),
      fetchRecentFills(),
      fetchTradeHistory(userId),
    ])

    // Build system prompt with all available context
    let systemWithContext = SYSTEM_PROMPT

    if (liveState) {
      systemWithContext += `\n\n---\n${liveState}`
    }
    if (recentFills) {
      systemWithContext += `\n\n---\n${recentFills}`
    }
    if (tradeHistory) {
      systemWithContext += `\n\n---\nHISTORICAL DATA:\n${tradeHistory}`
    }

    // If client sent session state directly (from realtime subscription), include it
    if (sessionState) {
      systemWithContext += `\n\n---\nCLIENT-SIDE SESSION STATE (most current):\n${JSON.stringify(sessionState, null, 2)}`
    }

    const recentMessages = messages.slice(-10) // increased from 5 for better session memory
    const apiMessages = recentMessages.map((m, i) => {
      if (i === recentMessages.length - 1 && m.role === 'user' && image) {
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
      max_tokens: 2048, // increased for DRC JSON responses
      system: systemWithContext,
      messages: apiMessages,
    })

    res.status(200).json({ message: response.content[0].text })
  } catch (err) {
    console.error('AI error:', err)
    res.status(500).json({ error: err.message })
  }
}