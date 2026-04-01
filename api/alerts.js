const BLS_API_KEY = process.env.BLS_API_KEY

// BLS series — what BLS API can actually provide
const BLS_SERIES = [
  { id: 'CUUR0000SA0',   name: 'CPI',              short: 'CPI' },
  { id: 'CUUR0000SA0L1E',name: 'Core CPI',          short: 'CORECPI' },
  { id: 'WPUFD4',        name: 'PPI Final Demand',  short: 'PPI' },
  { id: 'CES0000000001', name: 'Nonfarm Payrolls',  short: 'NFP' },
  { id: 'LNS14000000',   name: 'Unemployment Rate', short: 'UNRATE' },
  { id: 'JTS000000000000000JOR', name: 'JOLTS Job Openings', short: 'JOLTS' },
  { id: 'RSXFS',         name: 'Retail Sales',      short: 'RETAIL' },
]

// Hardcoded 2026 release schedule — auto-fallback if BLS schedule API fails
// All BLS releases at 8:30 AM ET (13:30 UTC) unless noted
// Fed releases at 2:00 PM ET (19:00 UTC)
// ISM releases at 10:00 AM ET (15:00 UTC)
// BEA (GDP/PCE) releases at 8:30 AM ET (13:30 UTC)
const RELEASE_SCHEDULE_2026 = {
  // BLS
  'CPI':     { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'CORECPI': { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'PPI':     { dates: ['2026-01-15','2026-02-12','2026-03-12','2026-04-14','2026-05-13','2026-06-12','2026-07-15','2026-08-13','2026-09-14','2026-10-14','2026-11-13','2026-12-14'], utcHour: 13 },
  'NFP':     { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'UNRATE':  { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'JOLTS':   { dates: ['2026-02-04','2026-03-04','2026-04-01','2026-05-05','2026-06-02','2026-07-07','2026-08-04','2026-09-01','2026-10-06','2026-11-03','2026-12-01'], utcHour: 13 },
  'RETAIL':  { dates: ['2026-01-16','2026-02-17','2026-03-17','2026-04-15','2026-05-15','2026-06-16','2026-07-16','2026-08-14','2026-09-16','2026-10-15','2026-11-17','2026-12-16'], utcHour: 13 },
  // Fed — not from BLS, handled separately as static alerts
  'FOMC':    { dates: ['2026-01-29','2026-03-18','2026-05-06','2026-06-17','2026-07-29','2026-09-16','2026-10-28','2026-12-09'], utcHour: 19 },
  'FOMC_MINUTES': { dates: ['2026-02-18','2026-04-08','2026-05-27','2026-07-08','2026-08-19','2026-10-07','2026-11-25'], utcHour: 19 },
  // BEA releases — GDP and PCE
  'GDP':     { dates: ['2026-01-29','2026-02-26','2026-03-26','2026-04-29','2026-05-28','2026-06-25','2026-07-30','2026-08-27','2026-09-30','2026-10-29','2026-11-25','2026-12-22'], utcHour: 13 },
  'PCE':     { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'COREPCE': { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'PERSONAL_INCOME':   { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'PERSONAL_SPENDING': { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  // ISM — not from BLS or BEA
  'ISM_MFG':  { dates: ['2026-02-03','2026-03-02','2026-04-01','2026-05-01','2026-06-01','2026-07-01','2026-08-03','2026-09-01','2026-10-01','2026-11-02','2026-12-01'], utcHour: 15 },
  'ISM_SVCS': { dates: ['2026-02-05','2026-03-04','2026-04-03','2026-05-05','2026-06-03','2026-07-07','2026-08-05','2026-09-03','2026-10-05','2026-11-04','2026-12-03'], utcHour: 15 },
  // Census Bureau
  'DURABLE':  { dates: ['2026-01-28','2026-02-25','2026-03-25','2026-04-24','2026-05-27','2026-06-24','2026-07-28','2026-08-26','2026-09-25','2026-10-28','2026-11-25','2026-12-23'], utcHour: 13 },
  'EXISTING_HOME': { dates: ['2026-01-23','2026-02-20','2026-03-20','2026-04-22','2026-05-21','2026-06-19','2026-07-22','2026-08-20','2026-09-22','2026-10-22','2026-11-19','2026-12-21'], utcHour: 15 },
}

function getReleaseTimestamp(short) {
  const schedule = RELEASE_SCHEDULE_2026[short]
  if (!schedule) return null

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const ytdStart = `${now.getFullYear()}-01-01`

  const past = schedule.dates
    .filter(d => d >= ytdStart && d <= todayStr)
    .sort()
    .reverse()

  if (!past.length) return null
  return new Date(`${past[0]}T${String(schedule.utcHour).padStart(2,'0')}:30:00.000Z`)
}

const FRED_API_KEY = process.env.FRED_API_KEY

// FRED series for non-BLS market-moving releases
const FRED_SERIES = [
  { id: 'PCEPILFE',        name: 'Core PCE Price Index',      short: 'COREPCE',          source: 'BEA' },
  { id: 'PCEPI',           name: 'PCE Price Index',            short: 'PCE',              source: 'BEA' },
  { id: 'PI',              name: 'Personal Income',            short: 'PERSONAL_INCOME',  source: 'BEA' },
  { id: 'PCE',             name: 'Personal Spending',          short: 'PERSONAL_SPENDING',source: 'BEA' },
  { id: 'A191RL1Q225SBEA', name: 'GDP Growth Rate QoQ',        short: 'GDP',              source: 'BEA' },
  { id: 'DGORDER',         name: 'Durable Goods Orders',       short: 'DURABLE',          source: 'CENSUS' },
  { id: 'EXHOSLUSM495S',   name: 'Existing Home Sales',        short: 'EXISTING_HOME',    source: 'NAR' },
  { id: 'FEDFUNDS',        name: 'Fed Interest Rate Decision', short: 'FOMC',             source: 'FEDERAL RESERVE' },
]

async function fetchFREDAlerts() {
  try {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const ytdStart = `${now.getFullYear()}-01-01`
    const alerts = []

    await Promise.allSettled(FRED_SERIES.map(async (series) => {
      try {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=3&observation_start=${ytdStart}`
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) })
        if (!r.ok) return

        const data = await r.json()
        const obs = data.observations?.filter(o => o.value !== '.' && o.date >= ytdStart)
        if (!obs?.length) return

        const latest = obs[0]
        const previous = obs[1]

        const releaseDate = latest.date
        if (releaseDate > todayStr) return

        const releaseTime = getReleaseTimestamp(series.short)
        const releaseTS = releaseTime || new Date(`${releaseDate}T13:30:00.000Z`)

        const releaseTimeMT = releaseTS.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver'
        })

        const actual = parseFloat(latest.value)
        const prev = previous ? parseFloat(previous.value) : null

        let changeStr = ''
        if (prev !== null && !isNaN(prev) && !isNaN(actual)) {
          const change = actual - prev
          const sign = change >= 0 ? '+' : ''
          changeStr = ` | Chg: ${sign}${change.toFixed(2)}`
        }

        const periodLabel = new Date(releaseDate + 'T12:00:00').toLocaleDateString('en-US', {
          month: 'short', year: 'numeric'
        })

        const headline = `⚡ ${series.name} — ${periodLabel} | Actual: ${actual}${prev !== null ? ` | Prev: ${prev}` : ''}${changeStr} | Released ${releaseTimeMT}`

        alerts.push({
          id: `fred-${series.id}-${releaseDate}`,
          headline,
          summary: `${series.name} for ${periodLabel}. Actual: ${actual}.${prev !== null ? ` Previous: ${prev}.` : ''}`,
          source: series.source,
          category: 'Alert',
          created_at: releaseTS.toISOString(),
          isAlert: true,
          alertType: 'economic',
          changePct: 0,
        })
      } catch (e) {
        console.error(`FRED ${series.id} error:`, e.message)
      }
    }))

    return alerts
  } catch (err) {
    console.error('FRED fetch error:', err)
    return []
  }
}

async function fetchForexFactoryAlerts() {
  try {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const ytdStart = `${now.getFullYear()}-01-01`

    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    })
    if (!r.ok) return []
    const data = await r.json()

    const HIGH_IMPACT = ['USD']
    const alerts = []

    for (const e of (Array.isArray(data) ? data : [])) {
      if (e.country !== 'USD') continue
      if (e.impact !== 'High' && e.impact !== 'Medium') continue
      if (!e.actual) continue // only show if actual is released

      const eventDate = new Date(e.date)
      const eventDateStr = eventDate.toISOString().slice(0, 10)
      if (eventDateStr < ytdStart || eventDateStr > todayStr) continue

      const releaseTimeET = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver'
      })

      let changeStr = ''
      if (e.previous && e.actual) {
        const actual = parseFloat(e.actual)
        const prev = parseFloat(e.previous)
        if (!isNaN(actual) && !isNaN(prev)) {
          const change = actual - prev
          const sign = change >= 0 ? '+' : ''
          changeStr = ` | Chg: ${sign}${change.toFixed(2)}`
        }
      }

      const headline = `⚡ ${e.title} — Actual: ${e.actual}${e.forecast ? ` | Forecast: ${e.forecast}` : ''}${e.previous ? ` | Prev: ${e.previous}` : ''}${changeStr} | Released ${releaseTimeET}`

      alerts.push({
        id: `ff-${e.title}-${eventDateStr}`,
        headline,
        summary: `${e.title}. Actual: ${e.actual}.${e.forecast ? ` Forecast: ${e.forecast}.` : ''}`,
        source: 'ECON DATA',
        category: 'Alert',
        created_at: eventDate.toISOString(),
        isAlert: true,
        alertType: 'economic',
        changePct: 0,
      })
    }

    return alerts
  } catch (err) {
    console.error('ForexFactory alerts error:', err)
    return []
  }
}

async function fetchBLSAlerts() {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const todayStr = now.toISOString().slice(0, 10)
    const ytdStart = `${currentYear}-01-01`

    const body = {
      seriesid: BLS_SERIES.map(s => s.id),
      startyear: String(currentYear),
      endyear: String(currentYear),
      registrationkey: BLS_API_KEY,
      catalog: true,
    }

    const r = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })

    if (!r.ok) return []
    const data = await r.json()
    if (data.status !== 'REQUEST_SUCCEEDED') return []

    const alerts = []

    for (const series of (data.Results?.series || [])) {
      const meta = BLS_SERIES.find(s => s.id === series.seriesID)
      if (!meta) continue

      const latestEntry = series.data?.[0]
      if (!latestEntry) continue

      const entryYear = parseInt(latestEntry.year)
      const entryPeriod = latestEntry.period
      const entryMonth = parseInt(entryPeriod.replace('M', ''))
      const monthsOld = (currentYear - entryYear) * 12 + (currentMonth - entryMonth)
      if (monthsOld > 2) continue

      const actual = latestEntry.value
      const prevEntry = series.data?.[1]
      const previous = prevEntry?.value || null

      const periodDate = new Date(entryYear, entryMonth - 1, 1)
      const periodLabel = periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      let changeStr = ''
      if (previous && actual) {
        const change = parseFloat(actual) - parseFloat(previous)
        const sign = change >= 0 ? '+' : ''
        changeStr = ` | Chg: ${sign}${change.toFixed(2)}`
      }

      const releaseTime = getReleaseTimestamp(meta.short)
      if (!releaseTime) continue

      const releaseDateStr = releaseTime.toISOString().slice(0, 10)
      if (releaseDateStr < ytdStart || releaseDateStr > todayStr) continue

      const releaseTimeET = releaseTime.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Denver'
      })

      const headline = `⚡ ${meta.name} — ${periodLabel} | Actual: ${actual}${previous ? ` | Prev: ${previous}` : ''}${changeStr} | Released ${releaseTimeET}`

      alerts.push({
        id: `bls-${series.seriesID}-${entryYear}-${entryPeriod}`,
        headline,
        summary: `${meta.name} for ${periodLabel}. Actual: ${actual}.${previous ? ` Previous: ${previous}.` : ''}`,
        source: 'BLS DATA',
        category: 'Alert',
        created_at: releaseTime.toISOString(),
        isAlert: true,
        alertType: 'economic',
        changePct: 0,
      })
    }

    return alerts
  } catch (err) {
    console.error('BLS fetch error:', err)
    return []
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=90')

  const alerts = []
  const now = new Date().toISOString()

  try {

    const [blsAlerts, fredAlerts, ffAlerts] = await Promise.all([
      fetchBLSAlerts(),
      fetchFREDAlerts(),
      fetchForexFactoryAlerts(),
    ])

    // ForexFactory is most real-time — dedupe BLS and FRED against it
    const ffTitles = new Set(ffAlerts.map(a => a.id))
    const dedupedBLS = blsAlerts.filter(a => !ffAlerts.some(f => f.headline.includes(a.source)))
    const dedupedFred = fredAlerts.filter(a => !ffAlerts.some(f => {
      const fredName = FRED_SERIES.find(s => a.id.includes(s.id))?.name || ''
      return f.headline.toLowerCase().includes(fredName.toLowerCase().slice(0, 8))
    }))

    const allAlerts = [...ffAlerts, ...dedupedBLS, ...dedupedFred, ...alerts]
    allAlerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.status(200).json({ alerts: allAlerts, count: allAlerts.length })
  } catch (err) {
    console.error('Alerts error:', err)
    res.status(200).json({ alerts: [], count: 0, error: err.message })
  }
}