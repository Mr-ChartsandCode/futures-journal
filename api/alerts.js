// Mag 7 + top index movers that actually move ES/NQ
const INDEX_MOVERS = [
  { symbol: 'AAPL',  name: 'Apple' },
  { symbol: 'MSFT',  name: 'Microsoft' },
  { symbol: 'NVDA',  name: 'Nvidia' },
  { symbol: 'AMZN',  name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'META',  name: 'Meta' },
  { symbol: 'TSLA',  name: 'Tesla' },
  { symbol: 'AVGO',  name: 'Broadcom' },
  { symbol: 'JPM',   name: 'JPMorgan' },
  { symbol: 'LLY',   name: 'Eli Lilly' },
  { symbol: 'V',     name: 'Visa' },
  { symbol: 'UNH',   name: 'UnitedHealth' },
  { symbol: 'XOM',   name: 'ExxonMobil' },
  { symbol: 'MA',    name: 'Mastercard' },
  { symbol: 'WMT',   name: 'Walmart' },
  { symbol: 'ORCL',  name: 'Oracle' },
  { symbol: 'MU',    name: 'Micron' },
  { symbol: 'CVX',   name: 'Chevron' },
  { symbol: 'NFLX',  name: 'Netflix' },
  { symbol: 'ABBV',  name: 'AbbVie' },
  { symbol: 'PLTR',  name: 'Palantir' },
  { symbol: 'AMD',   name: 'AMD' },
  { symbol: 'CAT',   name: 'Caterpillar' },
  { symbol: 'SPY',   name: 'S&P 500 ETF' },
  { symbol: 'QQQ',   name: 'Nasdaq ETF' },
  { symbol: 'VIX',   name: 'Volatility Index' },
]

const BLS_API_KEY = process.env.BLS_API_KEY

const BLS_SERIES = [
  { id: 'CUUR0000SA0',           name: 'CPI All Items',            short: 'CPI' },
  { id: 'CUUR0000SA0L1E',        name: 'Core CPI ex Food Energy',  short: 'CORECPI' },
  { id: 'CUUR0000SAF',           name: 'CPI Food',                 short: 'CPI_FOOD' },
  { id: 'CUUR0000SACE',          name: 'CPI Energy',               short: 'CPI_ENERGY' },
  { id: 'CUUR0000SAH',           name: 'CPI Shelter',              short: 'CPI_SHELTER' },
  { id: 'WPUFD4',                name: 'PPI Final Demand',         short: 'PPI' },
  { id: 'WPUFD49104',            name: 'PPI ex Food Energy',       short: 'COREPPI' },
  { id: 'WPSFD4131',             name: 'PPI Goods',                short: 'PPI_GOODS' },
  { id: 'CES0000000001',         name: 'Nonfarm Payrolls',         short: 'NFP' },
  { id: 'CES0500000001',         name: 'Private Payrolls',         short: 'PRIVATE_NFP' },
  { id: 'CES0600000001',         name: 'Manufacturing Payrolls',   short: 'MFG_NFP' },
  { id: 'LNS14000000',           name: 'Unemployment Rate',        short: 'UNRATE' },
  { id: 'LNS11300000',           name: 'Labor Force Participation',short: 'LFPR' },
  { id: 'CES0500000008',         name: 'Avg Hourly Earnings',      short: 'AHE' },
  { id: 'CES0500000007',         name: 'Avg Weekly Hours',         short: 'AWH' },
  { id: 'LNS12032194',           name: 'U6 Underemployment Rate',  short: 'U6' },
  { id: 'JTS000000000000000JOR', name: 'JOLTS Job Openings',       short: 'JOLTS' },
  { id: 'JTS000000000000000HIR', name: 'JOLTS Hires',              short: 'JOLTS_HIRES' },
  { id: 'JTS000000000000000QUR', name: 'JOLTS Quits Rate',         short: 'JOLTS_QUITS' },
  { id: 'OPHNFB',                name: 'Nonfarm Productivity',     short: 'PRODUCTIVITY' },
  { id: 'ULCNFB',                name: 'Unit Labor Costs',         short: 'ULC' },
  { id: 'EIUIR',                 name: 'Import Price Index',       short: 'IMPORT_PRICES' },
  { id: 'EIUEX',                 name: 'Export Price Index',       short: 'EXPORT_PRICES' },
]

const RELEASE_SCHEDULE_2026 = {
  'CPI':           { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'CORECPI':       { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'CPI_FOOD':      { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'CPI_ENERGY':    { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'CPI_SHELTER':   { dates: ['2026-01-14','2026-02-11','2026-03-11','2026-04-10','2026-05-12','2026-06-11','2026-07-14','2026-08-12','2026-09-11','2026-10-13','2026-11-12','2026-12-11'], utcHour: 13 },
  'PPI':           { dates: ['2026-01-15','2026-02-12','2026-03-12','2026-04-14','2026-05-13','2026-06-12','2026-07-15','2026-08-13','2026-09-14','2026-10-14','2026-11-13','2026-12-14'], utcHour: 13 },
  'COREPPI':       { dates: ['2026-01-15','2026-02-12','2026-03-12','2026-04-14','2026-05-13','2026-06-12','2026-07-15','2026-08-13','2026-09-14','2026-10-14','2026-11-13','2026-12-14'], utcHour: 13 },
  'PPI_GOODS':     { dates: ['2026-01-15','2026-02-12','2026-03-12','2026-04-14','2026-05-13','2026-06-12','2026-07-15','2026-08-13','2026-09-14','2026-10-14','2026-11-13','2026-12-14'], utcHour: 13 },
  'NFP':           { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'PRIVATE_NFP':   { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'MFG_NFP':       { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'UNRATE':        { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'LFPR':          { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'AHE':           { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'AWH':           { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'U6':            { dates: ['2026-01-09','2026-02-06','2026-03-06','2026-04-03','2026-05-08','2026-06-05','2026-07-02','2026-08-07','2026-09-04','2026-10-02','2026-11-06','2026-12-04'], utcHour: 13 },
  'JOLTS':         { dates: ['2026-02-04','2026-03-04','2026-04-01','2026-05-05','2026-06-02','2026-07-07','2026-08-04','2026-09-01','2026-10-06','2026-11-03','2026-12-01'], utcHour: 13 },
  'JOLTS_HIRES':   { dates: ['2026-02-04','2026-03-04','2026-04-01','2026-05-05','2026-06-02','2026-07-07','2026-08-04','2026-09-01','2026-10-06','2026-11-03','2026-12-01'], utcHour: 13 },
  'JOLTS_QUITS':   { dates: ['2026-02-04','2026-03-04','2026-04-01','2026-05-05','2026-06-02','2026-07-07','2026-08-04','2026-09-01','2026-10-06','2026-11-03','2026-12-01'], utcHour: 13 },
  'PRODUCTIVITY':  { dates: ['2026-02-05','2026-03-05','2026-05-07','2026-06-04','2026-08-06','2026-09-03','2026-11-05','2026-12-03'], utcHour: 13 },
  'ULC':           { dates: ['2026-02-05','2026-03-05','2026-05-07','2026-06-04','2026-08-06','2026-09-03','2026-11-05','2026-12-03'], utcHour: 13 },
  'IMPORT_PRICES': { dates: ['2026-01-16','2026-02-13','2026-03-13','2026-04-16','2026-05-15','2026-06-12','2026-07-17','2026-08-14','2026-09-11','2026-10-16','2026-11-13','2026-12-11'], utcHour: 13 },
  'EXPORT_PRICES': { dates: ['2026-01-16','2026-02-13','2026-03-13','2026-04-16','2026-05-15','2026-06-12','2026-07-17','2026-08-14','2026-09-11','2026-10-16','2026-11-13','2026-12-11'], utcHour: 13 },
  'FOMC':          { dates: ['2026-01-29','2026-03-18','2026-05-06','2026-06-17','2026-07-29','2026-09-16','2026-10-28','2026-12-09'], utcHour: 19 },
  'FOMC_MINUTES':  { dates: ['2026-02-18','2026-04-08','2026-05-27','2026-07-08','2026-08-19','2026-10-07','2026-11-25'], utcHour: 19 },
  'GDP':           { dates: ['2026-01-29','2026-02-26','2026-03-26','2026-04-29','2026-05-28','2026-06-25','2026-07-30','2026-08-27','2026-09-30','2026-10-29','2026-11-25','2026-12-22'], utcHour: 13 },
  'PCE':           { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'COREPCE':       { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'PERSONAL_INCOME':   { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'PERSONAL_SPENDING': { dates: ['2026-01-30','2026-02-27','2026-03-27','2026-04-30','2026-05-29','2026-06-26','2026-07-31','2026-08-28','2026-10-01','2026-10-30','2026-11-25','2026-12-23'], utcHour: 13 },
  'ISM_MFG':       { dates: ['2026-02-03','2026-03-02','2026-04-01','2026-05-01','2026-06-01','2026-07-01','2026-08-03','2026-09-01','2026-10-01','2026-11-02','2026-12-01'], utcHour: 15 },
  'ISM_SVCS':      { dates: ['2026-02-05','2026-03-04','2026-04-03','2026-05-05','2026-06-03','2026-07-07','2026-08-05','2026-09-03','2026-10-05','2026-11-04','2026-12-03'], utcHour: 15 },
  'DURABLE':       { dates: ['2026-01-28','2026-02-25','2026-03-25','2026-04-24','2026-05-27','2026-06-24','2026-07-28','2026-08-26','2026-09-25','2026-10-28','2026-11-25','2026-12-23'], utcHour: 13 },
  'EXISTING_HOME': { dates: ['2026-01-23','2026-02-20','2026-03-20','2026-04-22','2026-05-21','2026-06-19','2026-07-22','2026-08-20','2026-09-22','2026-10-22','2026-11-19','2026-12-21'], utcHour: 15 },
  'RETAIL':        { dates: ['2026-01-16','2026-02-17','2026-03-17','2026-04-15','2026-05-15','2026-06-16','2026-07-16','2026-08-14','2026-09-16','2026-10-15','2026-11-17','2026-12-16'], utcHour: 13 },
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

const FRED_SERIES = [
  { id: 'PCEPILFE',        name: 'Core PCE Price Index',      short: 'COREPCE',          source: 'BEA' },
  { id: 'PCEPI',           name: 'PCE Price Index',            short: 'PCE',              source: 'BEA' },
  { id: 'PI',              name: 'Personal Income',            short: 'PERSONAL_INCOME',  source: 'BEA' },
  { id: 'PCE',             name: 'Personal Spending',          short: 'PERSONAL_SPENDING',source: 'BEA' },
  { id: 'A191RL1Q225SBEA', name: 'GDP Growth Rate QoQ',        short: 'GDP',              source: 'BEA' },
  { id: 'DGORDER',         name: 'Durable Goods Orders',       short: 'DURABLE',          source: 'CENSUS' },
  { id: 'EXHOSLUSM495S',   name: 'Existing Home Sales',        short: 'EXISTING_HOME',    source: 'NAR' },
  { id: 'FEDFUNDS',        name: 'Fed Interest Rate Decision', short: 'FOMC',             source: 'FEDERAL RESERVE' },
  { id: 'RSAFS',           name: 'Retail Sales',               short: 'RETAIL',           source: 'CENSUS' },
  { id: 'NAPMPI',          name: 'ISM Manufacturing PMI',      short: 'ISM_MFG',          source: 'ISM' },
  { id: 'NMFPSI',          name: 'ISM Services PMI',           short: 'ISM_SVCS',         source: 'ISM' },
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
        const releaseTimeET = releaseTS.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'
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

        const headline = `⚡ ${series.name} — ${periodLabel} | Actual: ${actual}${prev !== null ? ` | Prev: ${prev}` : ''}${changeStr} | Released ${releaseTimeET} ET`

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
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'
      })

      const headline = `⚡ ${meta.name} — ${periodLabel} | Actual: ${actual}${previous ? ` | Prev: ${previous}` : ''}${changeStr} | Released ${releaseTimeET} ET`

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

  const stockAlerts = []
  const now = new Date().toISOString()

  try {
    // Index mover alerts — mag 7 + top index movers only
    const symbols = INDEX_MOVERS.map(t => t.symbol).join(',')
    try {
      const r = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=symbol,shortName,regularMarketChangePercent,regularMarketPrice,regularMarketChange`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' } }
      )
      const data = await r.json()
      const quotes = data?.quoteResponse?.result || []

      for (const quote of quotes) {
        const pct = quote.regularMarketChangePercent
        const threshold = quote.symbol === 'VIX' ? 10 : 4
        if (Math.abs(pct) >= threshold) {
          const dir = pct >= 0 ? 'up' : 'down'
          const sign = pct >= 0 ? '+' : ''
          stockAlerts.push({
            id: `mover-${quote.symbol}-${now.slice(0,10)}`,
            headline: `${quote.symbol} ${sign}${pct.toFixed(2)}% — ${quote.shortName || quote.symbol} significant move, watch ES/NQ impact`,
            summary: `${quote.shortName || quote.symbol} is ${dir} ${Math.abs(pct).toFixed(2)}% to $${quote.regularMarketPrice?.toFixed(2)}.`,
            source: 'MARKET ALERT',
            category: 'Alert',
            created_at: now,
            isAlert: true,
            alertType: 'mover',
            changePct: pct,
          })
        }
      }
    } catch (e) {
      console.error('Mover fetch error:', e.message)
    }

    const [blsAlerts, fredAlerts] = await Promise.all([
      fetchBLSAlerts(),
      fetchFREDAlerts(),
    ])

    const allAlerts = [...blsAlerts, ...fredAlerts, ...stockAlerts]
    allAlerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.status(200).json({ alerts: allAlerts, count: allAlerts.length })
  } catch (err) {
    console.error('Alerts error:', err)
    res.status(200).json({ alerts: [], count: 0, error: err.message })
  }
}