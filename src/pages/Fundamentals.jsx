import { useState } from 'react'

const TICKERS = [
  { symbol: 'MSFT',  name: 'Microsoft',         sector: 'Technology',             cap: 3100 },
  { symbol: 'AAPL',  name: 'Apple',              sector: 'Technology',             cap: 3000 },
  { symbol: 'NVDA',  name: 'Nvidia',             sector: 'Technology',             cap: 2900 },
  { symbol: 'AVGO',  name: 'Broadcom',           sector: 'Technology',             cap: 780 },
  { symbol: 'ORCL',  name: 'Oracle',             sector: 'Technology',             cap: 460 },
  { symbol: 'CRM',   name: 'Salesforce',         sector: 'Technology',             cap: 290 },
  { symbol: 'ADBE',  name: 'Adobe',              sector: 'Technology',             cap: 185 },
  { symbol: 'QCOM',  name: 'Qualcomm',           sector: 'Technology',             cap: 165 },
  { symbol: 'AMD',   name: 'AMD',                sector: 'Technology',             cap: 160 },
  { symbol: 'INTC',  name: 'Intel',              sector: 'Technology',             cap: 90 },
  { symbol: 'IBM',   name: 'IBM',                sector: 'Technology',             cap: 210 },
  { symbol: 'CSCO',  name: 'Cisco',              sector: 'Technology',             cap: 200 },
  { symbol: 'ACN',   name: 'Accenture',          sector: 'Technology',             cap: 195 },
  { symbol: 'TXN',   name: 'Texas Instruments',  sector: 'Technology',             cap: 160 },
  { symbol: 'MU',    name: 'Micron',             sector: 'Technology',             cap: 100 },
  { symbol: 'PANW',  name: 'Palo Alto',          sector: 'Technology',             cap: 115 },
  { symbol: 'AMZN',  name: 'Amazon',             sector: 'Consumer Discretionary', cap: 2100 },
  { symbol: 'TSLA',  name: 'Tesla',              sector: 'Consumer Discretionary', cap: 800 },
  { symbol: 'HD',    name: 'Home Depot',         sector: 'Consumer Discretionary', cap: 340 },
  { symbol: 'MCD',   name: 'McDonald\'s',        sector: 'Consumer Discretionary', cap: 210 },
  { symbol: 'SBUX',  name: 'Starbucks',          sector: 'Consumer Discretionary', cap: 90 },
  { symbol: 'NKE',   name: 'Nike',               sector: 'Consumer Discretionary', cap: 80 },
  { symbol: 'LOW',   name: 'Lowe\'s',            sector: 'Consumer Discretionary', cap: 130 },
  { symbol: 'GOOGL', name: 'Alphabet',           sector: 'Communication Services', cap: 2100 },
  { symbol: 'META',  name: 'Meta',               sector: 'Communication Services', cap: 1600 },
  { symbol: 'NFLX',  name: 'Netflix',            sector: 'Communication Services', cap: 380 },
  { symbol: 'DIS',   name: 'Disney',             sector: 'Communication Services', cap: 170 },
  { symbol: 'CMCSA', name: 'Comcast',            sector: 'Communication Services', cap: 140 },
  { symbol: 'T',     name: 'AT&T',               sector: 'Communication Services', cap: 130 },
  { symbol: 'VZ',    name: 'Verizon',            sector: 'Communication Services', cap: 160 },
  { symbol: 'JPM',   name: 'JPMorgan',           sector: 'Financials',             cap: 700 },
  { symbol: 'V',     name: 'Visa',               sector: 'Financials',             cap: 540 },
  { symbol: 'MA',    name: 'Mastercard',         sector: 'Financials',             cap: 460 },
  { symbol: 'BAC',   name: 'Bank of America',    sector: 'Financials',             cap: 310 },
  { symbol: 'GS',    name: 'Goldman Sachs',      sector: 'Financials',             cap: 180 },
  { symbol: 'MS',    name: 'Morgan Stanley',     sector: 'Financials',             cap: 160 },
  { symbol: 'WFC',   name: 'Wells Fargo',        sector: 'Financials',             cap: 220 },
  { symbol: 'SPGI',  name: 'S&P Global',         sector: 'Financials',             cap: 150 },
  { symbol: 'BLK',   name: 'BlackRock',          sector: 'Financials',             cap: 120 },
  { symbol: 'AXP',   name: 'Amex',               sector: 'Financials',             cap: 180 },
  { symbol: 'C',     name: 'Citigroup',          sector: 'Financials',             cap: 130 },
  { symbol: 'UNH',   name: 'UnitedHealth',       sector: 'Healthcare',             cap: 470 },
  { symbol: 'JNJ',   name: 'J&J',                sector: 'Healthcare',             cap: 370 },
  { symbol: 'LLY',   name: 'Eli Lilly',          sector: 'Healthcare',             cap: 700 },
  { symbol: 'ABBV',  name: 'AbbVie',             sector: 'Healthcare',             cap: 310 },
  { symbol: 'MRK',   name: 'Merck',              sector: 'Healthcare',             cap: 240 },
  { symbol: 'TMO',   name: 'Thermo Fisher',      sector: 'Healthcare',             cap: 200 },
  { symbol: 'ABT',   name: 'Abbott',             sector: 'Healthcare',             cap: 210 },
  { symbol: 'ISRG',  name: 'Intuitive Surgical', sector: 'Healthcare',             cap: 190 },
  { symbol: 'AMGN',  name: 'Amgen',              sector: 'Healthcare',             cap: 140 },
  { symbol: 'GILD',  name: 'Gilead',             sector: 'Healthcare',             cap: 110 },
  { symbol: 'REGN',  name: 'Regeneron',          sector: 'Healthcare',             cap: 90 },
  { symbol: 'MDT',   name: 'Medtronic',          sector: 'Healthcare',             cap: 110 },
  { symbol: 'BMY',   name: 'Bristol-Myers',      sector: 'Healthcare',             cap: 120 },
  { symbol: 'XOM',   name: 'ExxonMobil',         sector: 'Energy',                 cap: 490 },
  { symbol: 'CVX',   name: 'Chevron',            sector: 'Energy',                 cap: 270 },
  { symbol: 'COP',   name: 'ConocoPhillips',     sector: 'Energy',                 cap: 120 },
  { symbol: 'SLB',   name: 'SLB',                sector: 'Energy',                 cap: 55 },
  { symbol: 'EOG',   name: 'EOG Resources',      sector: 'Energy',                 cap: 65 },
  { symbol: 'PG',    name: 'Procter & Gamble',   sector: 'Consumer Staples',       cap: 370 },
  { symbol: 'KO',    name: 'Coca-Cola',          sector: 'Consumer Staples',       cap: 290 },
  { symbol: 'PEP',   name: 'PepsiCo',            sector: 'Consumer Staples',       cap: 210 },
  { symbol: 'COST',  name: 'Costco',             sector: 'Consumer Staples',       cap: 400 },
  { symbol: 'WMT',   name: 'Walmart',            sector: 'Consumer Staples',       cap: 770 },
  { symbol: 'PM',    name: 'Philip Morris',      sector: 'Consumer Staples',       cap: 220 },
  { symbol: 'CAT',   name: 'Caterpillar',        sector: 'Industrials',            cap: 170 },
  { symbol: 'BA',    name: 'Boeing',             sector: 'Industrials',            cap: 110 },
  { symbol: 'HON',   name: 'Honeywell',          sector: 'Industrials',            cap: 130 },
  { symbol: 'UPS',   name: 'UPS',                sector: 'Industrials',            cap: 100 },
  { symbol: 'RTX',   name: 'RTX',                sector: 'Industrials',            cap: 160 },
  { symbol: 'DE',    name: 'John Deere',         sector: 'Industrials',            cap: 110 },
  { symbol: 'GE',    name: 'GE',                 sector: 'Industrials',            cap: 200 },
  { symbol: 'LMT',   name: 'Lockheed Martin',    sector: 'Industrials',            cap: 110 },
  { symbol: 'LIN',   name: 'Linde',              sector: 'Materials',              cap: 210 },
  { symbol: 'APD',   name: 'Air Products',       sector: 'Materials',              cap: 60 },
  { symbol: 'SHW',   name: 'Sherwin-Williams',   sector: 'Materials',              cap: 90 },
  { symbol: 'NEE',   name: 'NextEra Energy',     sector: 'Utilities',              cap: 140 },
  { symbol: 'DUK',   name: 'Duke Energy',        sector: 'Utilities',              cap: 90 },
  { symbol: 'SO',    name: 'Southern Co',        sector: 'Utilities',              cap: 90 },
  { symbol: 'PLD',   name: 'Prologis',           sector: 'Real Estate',            cap: 100 },
  { symbol: 'AMT',   name: 'American Tower',     sector: 'Real Estate',            cap: 90 },
  { symbol: 'EQIX',  name: 'Equinix',            sector: 'Real Estate',            cap: 80 },
  { symbol: 'DHR',   name: 'Danaher',            sector: 'Healthcare',             cap: 160 },
  { symbol: 'ZTS',   name: 'Zoetis',             sector: 'Healthcare',             cap: 80 },
  { symbol: 'SYK',   name: 'Stryker',            sector: 'Healthcare',             cap: 130 },
  { symbol: 'CB',    name: 'Chubb',              sector: 'Financials',             cap: 110 },
  { symbol: 'CI',    name: 'Cigna',              sector: 'Healthcare',             cap: 90 },
]

const SECTORS = [...new Set(TICKERS.map(t => t.sector))]

function fmt(n, decimals = 1) {
  if (n === null || n === undefined) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(decimals)}B`
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(decimals)}M`
  return `$${n.toLocaleString()}`
}

function pct(n) {
  if (n === null || n === undefined) return '—'
  return `${(n * 100).toFixed(1)}%`
}

function num(n, decimals = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(decimals)
}

function changeColor(val) {
  if (!val) return '#666'
  return parseFloat(val) >= 0 ? '#70c0ff' : '#ff6060'
}

const CARD = { background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderTop: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }
const LABEL = { fontSize: 10, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }
const ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #111' }
const KEY = { fontSize: 13, color: '#888' }
const VAL = { fontSize: 13, fontWeight: 600, color: '#e0e0e0' }

export default function Fundamentals() {
  const [search, setSearch] = useState('')
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSector, setActiveSector] = useState('Technology')

  const suggestions = search.length > 0
    ? TICKERS.filter(t => t.symbol.startsWith(search.toUpperCase()) || t.name.toLowerCase().startsWith(search.toLowerCase())).slice(0, 8)
    : []

  async function fetchFundamentals(sym) {
    setLoading(true)
    setError(null)
    setData(null)
    setSymbol(sym)
    setSearch('')
    try {
      const res = await fetch(`/api/fundamentals?symbol=${sym}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (!json.profile) throw new Error('No data found for ' + sym)
      setData(json)
      setActiveTab('overview')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const sectorTickers = TICKERS
    .filter(t => t.sector === activeSector)
    .sort((a, b) => b.cap - a.cap)

  const TABS = ['overview', 'income', 'balance', 'cashflow', 'estimates']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font)' }}>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(180deg,#0f0f0f,#000)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f0f0' }}>Fundamentals</span>
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search && fetchFundamentals(search.toUpperCase())}
            placeholder="Search ticker or company..."
            style={{ width: 240, fontSize: 13, padding: '6px 10px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0f0f0' }}
          />
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, background: '#111', border: '1px solid #222', borderRadius: 6, zIndex: 100, width: 240, marginTop: 2 }}>
              {suggestions.map(t => (
                <div key={t.symbol} onClick={() => fetchFundamentals(t.symbol)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#e0e0e0', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                  <span style={{ color: '#555', fontSize: 12 }}>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {symbol && <span style={{ fontSize: 12, color: '#555', letterSpacing: '0.05em' }}>VIEWING: <span style={{ color: '#70c0ff', fontWeight: 700 }}>{symbol}</span></span>}
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '180px 1fr', overflow: 'hidden' }}>

        <div style={{ borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
            {SECTORS.map(s => (
              <button key={s} onClick={() => setActiveSector(s)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px',
                fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', marginBottom: 1, letterSpacing: '0.03em',
                background: activeSector === s ? '#001428' : 'transparent',
                color: activeSector === s ? '#70c0ff' : '#555',
                fontWeight: activeSector === s ? 700 : 400,
              }}>{s}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sectorTickers.map(t => (
              <div key={t.symbol} onClick={() => fetchFundamentals(t.symbol)} style={{
                padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #0f0f0f',
                background: symbol === t.symbol ? '#001428' : 'transparent',
                borderLeft: symbol === t.symbol ? '2px solid #0084ff' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => { if (symbol !== t.symbol) e.currentTarget.style.background = '#0d0d0d' }}
                onMouseLeave={e => { if (symbol !== t.symbol) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: symbol === t.symbol ? '#70c0ff' : '#e0e0e0' }}>{t.symbol}</div>
                <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {!data && !loading && !error && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13, letterSpacing: '0.05em' }}>
              SELECT A TICKER TO VIEW FUNDAMENTALS
            </div>
          )}

          {loading && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12, letterSpacing: '0.05em' }}>
              LOADING {symbol}...
            </div>
          )}

          {error && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
              {error}
            </div>
          )}

          {data && (
            <div style={{ padding: '16px 20px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    {data.profile.image && <img src={data.profile.image} alt="" style={{ width: 32, height: 32, borderRadius: 6 }} />}
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{data.profile.symbol}</span>
                    <span style={{ fontSize: 14, color: '#888' }}>{data.profile.companyName}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: '#001428', color: '#70c0ff', border: '1px solid #003080', borderRadius: 4 }}>{data.profile.sector}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#555' }}>{data.profile.exchange} · {data.profile.industry}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>${data.currentPrice?.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>Mkt Cap: {fmt(data.profile.marketCap)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: 16 }}>
                {Object.entries(data.priceChanges).map(([period, change]) => (
                  <div key={period} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', marginBottom: 4 }}>{period}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: changeColor(change) }}>
                      {change ? `${parseFloat(change) >= 0 ? '+' : ''}${change}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #1a1a1a', paddingBottom: 12 }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font)', fontWeight: activeTab === tab ? 700 : 400, letterSpacing: '0.04em',
                    background: activeTab === tab ? '#001428' : 'transparent',
                    color: activeTab === tab ? '#70c0ff' : '#555',
                    textTransform: 'uppercase',
                  }}>{tab}</button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={CARD}>
                      <div style={LABEL}>Key ratios</div>
                      {[
                        ['P/E (TTM)', num(data.ratios?.priceToEarningsRatioTTM)],
                        ['P/B (TTM)', num(data.ratios?.priceToBookRatioTTM)],
                        ['P/FCF (TTM)', num(data.ratios?.priceToFreeCashFlowRatioTTM)],
                        ['P/S (TTM)', num(data.ratios?.priceToSalesRatioTTM)],
                        ['ROE (TTM)', pct(data.ratios?.returnOnEquityTTM)],
                        ['Debt/Equity', num(data.ratios?.debtToEquityRatioTTM)],
                        ['Current Ratio', num(data.ratios?.currentRatioTTM)],
                        ['Gross Margin', pct(data.ratios?.grossProfitMarginTTM)],
                        ['Net Margin', pct(data.ratios?.netProfitMarginTTM)],
                        ['FCF/OCF', pct(data.ratios?.freeCashFlowOperatingCashFlowRatioTTM)],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                    </div>

                    <div style={CARD}>
                      <div style={LABEL}>Price targets</div>
                      {data.priceTarget && [
                        ['Consensus', `$${data.priceTarget.targetConsensus?.toFixed(2)}`],
                        ['Median', `$${data.priceTarget.targetMedian?.toFixed(2)}`],
                        ['High', `$${data.priceTarget.targetHigh?.toFixed(2)}`],
                        ['Low', `$${data.priceTarget.targetLow?.toFixed(2)}`],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                      {data.priceTargetSummary && [
                        ['Last month avg', `$${data.priceTargetSummary.lastMonthAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastMonthCount})`],
                        ['Last quarter avg', `$${data.priceTargetSummary.lastQuarterAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastQuarterCount})`],
                        ['Last year avg', `$${data.priceTargetSummary.lastYearAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastYearCount})`],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={CARD}>
                      <div style={LABEL}>Company</div>
                      {[
                        ['CEO', data.profile.ceo],
                        ['Employees', parseInt(data.profile.fullTimeEmployees)?.toLocaleString()],
                        ['IPO Date', data.profile.ipoDate],
                        ['Country', data.profile.country],
                      ].map(([k, v]) => (
                        <div key={k} style={ROW}>
                          <span style={KEY}>{k}</span>
                          <span style={VAL}>{v || '—'}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                        {data.profile.description?.slice(0, 300)}...
                      </div>
                    </div>

                    <div style={CARD}>
                      <div style={LABEL}>Earnings</div>
                      {data.earnings.slice(0, 5).map((e, i) => (
                        <div key={i} style={ROW}>
                          <span style={KEY}>{e.date}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, color: '#e0e0e0' }}>Est: {e.epsEstimated ? `$${e.epsEstimated}` : '—'}</div>
                            {e.epsActual !== null && <div style={{ fontSize: 11, color: e.epsActual >= e.epsEstimated ? '#70c0ff' : '#ff6060' }}>Actual: ${e.epsActual}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'income' && (
                <div style={CARD}>
                  <div style={LABEL}>Income statement</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {data.income.map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Revenue', 'revenue'],
                          ['Gross Profit', 'grossProfit'],
                          ['Operating Income', 'operatingIncome'],
                          ['Net Income', 'netIncome'],
                          ['EBITDA', 'ebitda'],
                          ['EPS', 'eps'],
                          ['EPS Diluted', 'epsDiluted'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {data.income.map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {key === 'eps' || key === 'epsDiluted' ? `$${q[key]?.toFixed(2)}` : fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'balance' && (
                <div style={CARD}>
                  <div style={LABEL}>Balance sheet</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {data.balance.map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Cash & ST Investments', 'cashAndShortTermInvestments'],
                          ['Total Assets', 'totalAssets'],
                          ['Total Debt', 'totalDebt'],
                          ['Net Debt', 'netDebt'],
                          ['Total Liabilities', 'totalLiabilities'],
                          ['Total Equity', 'totalEquity'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {data.balance.map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'cashflow' && (
                <div style={CARD}>
                  <div style={LABEL}>Cash flow</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {data.cashflow.map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 7)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Operating Cash Flow', 'operatingCashFlow'],
                          ['Capital Expenditure', 'capitalExpenditure'],
                          ['Free Cash Flow', 'freeCashFlow'],
                          ['Net Income', 'netIncome'],
                          ['Stock Buybacks', 'commonStockRepurchased'],
                          ['Dividends Paid', 'commonDividendsPaid'],
                          ['Net Change in Cash', 'netChangeInCash'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {data.cashflow.map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: q[key] < 0 ? '#ff6060' : '#e0e0e0' }}>
                                {fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'estimates' && (
                <div style={CARD}>
                  <div style={LABEL}>Analyst estimates — annual</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11 }}>Metric</th>
                          {data.analyst.map(q => <th key={q.date} style={{ padding: '8px', textAlign: 'right', color: '#555', fontWeight: 600, fontSize: 11 }}>{q.date?.slice(0, 4)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Revenue (avg)', 'revenueAvg'],
                          ['Revenue (low)', 'revenueLow'],
                          ['Revenue (high)', 'revenueHigh'],
                          ['EPS (avg)', 'epsAvg'],
                          ['EPS (low)', 'epsLow'],
                          ['EPS (high)', 'epsHigh'],
                          ['EBITDA (avg)', 'ebitdaAvg'],
                          ['Net Income (avg)', 'netIncomeAvg'],
                          ['# Analysts (EPS)', 'numAnalystsEps'],
                        ].map(([label, key]) => (
                          <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                            <td style={{ padding: '7px 8px', color: '#888' }}>{label}</td>
                            {data.analyst.map(q => (
                              <td key={q.date} style={{ padding: '7px 8px', textAlign: 'right', color: '#e0e0e0' }}>
                                {key.startsWith('eps') || key === 'numAnalystsEps'
                                  ? key === 'numAnalystsEps' ? q[key] : `$${q[key]?.toFixed(2)}`
                                  : fmt(q[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}