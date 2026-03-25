import { useState } from 'react'

const SP500_TICKERS = [
  'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK.B','JPM','V',
  'UNH','XOM','MA','PG','JNJ','HD','CVX','MRK','ABBV','PEP','KO','AVGO',
  'COST','MCD','CSCO','ACN','LIN','TXN','DHR','ABT','NKE','TMO','NEE',
  'PM','ORCL','CRM','ADBE','QCOM','HON','IBM','LOW','AMGN','UPS','CAT',
  'GS','BA','SBUX','RTX','DE','SPGI','BLK','AXP','GILD','MDT','T','VZ',
  'BMY','LMT','ISRG','REGN','ZTS','SYK','AMD','INTC','NFLX','DIS','CMCSA',
  'F','GM','GE','BAC','WFC','C','MS','WMT','PLD','CI','CB','PANW','MU',
]

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

  const suggestions = search.length > 0
    ? SP500_TICKERS.filter(t => t.startsWith(search.toUpperCase())).slice(0, 8)
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
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

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
            placeholder="Search ticker (e.g. AAPL)"
            style={{ width: 220, fontSize: 13, padding: '6px 10px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0f0f0' }}
          />
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, background: '#111', border: '1px solid #222', borderRadius: 6, zIndex: 100, width: 220, marginTop: 2 }}>
              {suggestions.map(t => (
                <div key={t} onClick={() => fetchFundamentals(t)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#e0e0e0', borderBottom: '1px solid #1a1a1a' }}
                  onMouseEnter={e => e.target.style.background = '#1a1a1a'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['AAPL','MSFT','NVDA','JPM','XOM','TSLA'].map(t => (
            <button key={t} onClick={() => fetchFundamentals(t)} style={{
              fontSize: 11, padding: '4px 8px', borderRadius: 4, border: '1px solid #222',
              background: symbol === t ? '#001428' : 'transparent', color: symbol === t ? '#70c0ff' : '#555',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {!data && !loading && !error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13, letterSpacing: '0.05em' }}>
          SEARCH A TICKER TO VIEW FUNDAMENTALS
        </div>
      )}

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, letterSpacing: '0.05em' }}>
          LOADING {symbol}...
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

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
                    ['FCF Margin', pct(data.ratios?.freeCashFlowOperatingCashFlowRatioTTM)],
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
                    ['Last month avg', `$${data.priceTargetSummary.lastMonthAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastMonthCount} analysts)`],
                    ['Last quarter avg', `$${data.priceTargetSummary.lastQuarterAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastQuarterCount} analysts)`],
                    ['Last year avg', `$${data.priceTargetSummary.lastYearAvgPriceTarget?.toFixed(2)} (${data.priceTargetSummary.lastYearCount} analysts)`],
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
                  <div style={LABEL}>Upcoming earnings</div>
                  {data.earnings.slice(0, 5).map((e, i) => (
                    <div key={i} style={ROW}>
                      <span style={KEY}>{e.date}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#e0e0e0' }}>EPS est: {e.epsEstimated ? `$${e.epsEstimated}` : '—'}</div>
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
              <div style={LABEL}>Income statement — quarterly</div>
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
              <div style={LABEL}>Balance sheet — quarterly</div>
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
                      ['Book Value/Share', 'bookValuePerShare'],
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
              <div style={LABEL}>Cash flow — quarterly</div>
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
            <div>
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}