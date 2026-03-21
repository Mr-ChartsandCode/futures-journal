import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TICK = {
  ES:  { size: 0.25, value: 12.50 }, NQ:  { size: 0.25, value: 5.00  },
  CL:  { size: 0.01, value: 10.00 }, GC:  { size: 0.10, value: 10.00 },
  MES: { size: 0.25, value: 1.25  }, MNQ: { size: 0.25, value: 0.50  },
  MCL: { size: 0.01, value: 1.00  }, MGC: { size: 0.10, value: 1.00  },
}

export default function TradeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trade, setTrade] = useState(null)
  const [tags, setTags] = useState([])
  const [screenshotUrl, setScreenshotUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('trades').select(`*, trade_tags ( tags ( id, name ) )`).eq('id', id).single()
      if (error || !data) { navigate('/'); return }
      setTrade(data)
      setTags(data.trade_tags?.map(tt => tt.tags?.name).filter(Boolean) || [])
      if (data.screenshot_url) {
        const { data: signed } = await supabase.storage.from('chart-screenshots').createSignedUrl(data.screenshot_url, 3600)
        if (signed) setScreenshotUrl(signed.signedUrl)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    if (trade.screenshot_url) await supabase.storage.from('chart-screenshots').remove([trade.screenshot_url])
    await supabase.from('trade_tags').delete().eq('trade_id', id)
    await supabase.from('trades').delete().eq('id', id)
    navigate('/')
  }

  const fmt = (n) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const isMicro = trade && ['MES','MNQ','MCL','MGC'].includes(trade.instrument)
  const label = { fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>LOADING...</div>

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px' }}>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: 0 }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Trade Detail</span>
      </div>

      <div className="card" style={{ padding: '14px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{trade.instrument}</span>
              {isMicro && <span style={{ fontSize: 9, background: '#1a1200', color: '#EF9F27', padding: '2px 6px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.06em', border: '1px solid #3a2800' }}>MICRO</span>}
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: trade.direction === 'long' ? 'var(--blue-text)' : 'var(--red-text)' }}>
                {trade.direction.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {trade.trade_date}{trade.entry_time ? ` · ${trade.entry_time}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}
              style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {fmt(trade.pnl)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {trade.ticks} ticks · {trade.contracts} ct
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {[
            { label: 'Entry', value: trade.entry_price },
            { label: 'Exit', value: trade.exit_price },
            { label: 'Tick value', value: `$${TICK[trade.instrument]?.value}/tick` },
          ].map(({ label: l, value }) => (
            <div key={l} className="card-inner" style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div style={label}>Setup</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map(tag => <span key={tag} className="pill-active" style={{ cursor: 'default' }}>{tag}</span>)}
          </div>
        </div>
      )}

      {trade.emotion && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div style={label}>Emotion</div>
          <span className="pill-active" style={{ cursor: 'default' }}>{trade.emotion.replace('_', ' ')}</span>
        </div>
      )}

      {screenshotUrl && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div style={label}>Chart</div>
          <img src={screenshotUrl} alt="Chart" style={{ width: '100%', borderRadius: 6, display: 'block', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,20,0.6)' }} />
        </div>
      )}

      {trade.notes && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
          <div style={label}>Notes</div>
          <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.7, margin: 0 }}>{trade.notes}</p>
        </div>
      )}

<div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => navigate(`/trade/${id}/edit`)} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
          EDIT TRADE
        </button>
        {!confirmDelete ? (
          <button onClick={handleDelete} className="btn-ghost" style={{ width: '100%', padding: '8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--red)', borderColor: '#2a0010' }}>
            DELETE TRADE
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 11 }}>CANCEL</button>
            <button onClick={handleDelete} disabled={deleting} style={{
              flex: 1, padding: '8px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: '1px solid #800020',
              background: 'linear-gradient(180deg,#300010,#1e0008)', color: 'var(--red-text)',
              cursor: deleting ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
              boxShadow: '0 0 12px rgba(255,0,32,0.2)'
            }}>
              {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}