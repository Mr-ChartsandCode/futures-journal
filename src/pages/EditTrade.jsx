import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TICK = {
  ES:  { size: 0.25, value: 12.50 }, NQ:  { size: 0.25, value: 5.00  },
  CL:  { size: 0.01, value: 10.00 }, GC:  { size: 0.10, value: 10.00 },
  MES: { size: 0.25, value: 1.25  }, MNQ: { size: 0.25, value: 0.50  },
  MCL: { size: 0.01, value: 1.00  }, MGC: { size: 0.10, value: 1.00  },
}

const SETUPS = ['Breakout','Pullback','VWAP reclaim','Opening range','Trend follow','Reversal','News play']
const EMOTIONS = ['focused','confident','anxious','rushed','revenge_trading','fomo','neutral','tired']

function calcPnl(instrument, direction, entry, exit, contracts) {
  const t = TICK[instrument]
  if (!t || isNaN(entry) || isNaN(exit)) return { pnl: null, ticks: null }
  const diff = direction === 'long' ? (exit - entry) : (entry - exit)
  const ticks = Math.round(diff / t.size)
  const pnl = Math.round(ticks * t.value * contracts * 100) / 100
  return { pnl, ticks }
}

export default function EditTrade() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [existingScreenshot, setExistingScreenshot] = useState(null)
  const [removeScreenshot, setRemoveScreenshot] = useState(false)

  const [form, setForm] = useState({
    instrument: 'ES', direction: 'long',
    trade_date: '', entry_time: '',
    entry_price: '', exit_price: '', contracts: 1,
    emotion: '', notes: '',
  })

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('trades')
        .select(`*, trade_tags ( tags ( id, name ) )`)
        .eq('id', id)
        .single()

      if (error || !data) { navigate('/'); return }

      setForm({
        instrument: data.instrument,
        direction: data.direction,
        trade_date: data.trade_date,
        entry_time: data.entry_time || '',
        entry_price: data.entry_price,
        exit_price: data.exit_price,
        contracts: data.contracts,
        emotion: data.emotion || '',
        notes: data.notes || '',
      })

      setSelectedTags(data.trade_tags?.map(tt => tt.tags?.name).filter(Boolean) || [])

      if (data.screenshot_url) {
        const { data: signed } = await supabase.storage
          .from('chart-screenshots')
          .createSignedUrl(data.screenshot_url, 3600)
        if (signed) setExistingScreenshot({ url: signed.signedUrl, path: data.screenshot_url })
      }

      setLoading(false)
    }
    load()
  }, [id])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const toggleTag = (tag) => setSelectedTags(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
  )

  const { pnl, ticks } = calcPnl(
    form.instrument, form.direction,
    parseFloat(form.entry_price), parseFloat(form.exit_price), form.contracts
  )
  const isMicro = ['MES','MNQ','MCL','MGC'].includes(form.instrument)

  async function handleSubmit() {
    if (!form.entry_price || !form.exit_price) { setError('Entry and exit prices required.'); return }
    if (pnl === null) { setError('Could not calculate P&L.'); return }
    setSaving(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    let screenshot_url = existingScreenshot?.path || null

    if (removeScreenshot && existingScreenshot) {
      await supabase.storage.from('chart-screenshots').remove([existingScreenshot.path])
      screenshot_url = null
    }

    if (screenshotFile) {
      if (existingScreenshot && !removeScreenshot) {
        await supabase.storage.from('chart-screenshots').remove([existingScreenshot.path])
      }
      const ext = screenshotFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('chart-screenshots').upload(path, screenshotFile)
      if (!uploadError) screenshot_url = path
    }

    const { error: updateError } = await supabase
      .from('trades')
      .update({
        instrument: form.instrument,
        direction: form.direction,
        trade_date: form.trade_date,
        entry_time: form.entry_time || null,
        entry_price: parseFloat(form.entry_price),
        exit_price: parseFloat(form.exit_price),
        contracts: parseInt(form.contracts),
        pnl, ticks,
        emotion: form.emotion || null,
        screenshot_url,
        notes: form.notes || null,
      })
      .eq('id', id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    await supabase.from('trade_tags').delete().eq('trade_id', id)

    for (const name of selectedTags) {
      let { data: tag } = await supabase
        .from('tags').select('id')
        .eq('name', name).eq('user_id', user.id).maybeSingle()

      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags').insert([{ name, user_id: user.id }]).select().single()
        tag = newTag
      }

      await supabase.from('trade_tags').insert([{ trade_id: id, tag_id: tag.id }])
    }

    setSaving(false)
    navigate(`/trade/${id}`)
  }

  const sectionLabel = { fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }
  const fieldLabel = { fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }
  const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, marginBottom: 10 }

  if (loading) return <div style={{ padding: 40, color: 'var(--muted)', fontSize: 12, letterSpacing: '0.05em' }}>LOADING...</div>

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 16px' }}>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 12, paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(`/trade/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: 0 }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Edit Trade</span>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', color: 'var(--red-text)', padding: '8px 12px', borderRadius: 6, marginBottom: 8, fontSize: 12, border: '1px solid #3a0000' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
        <div style={sectionLabel}>Trade details</div>
        <div style={grid3}>
          <div><label style={fieldLabel}>Instrument</label>
            <select value={form.instrument} onChange={e => set('instrument', e.target.value)}>
              <optgroup label="Standard">
                <option value="ES">ES · S&P 500</option><option value="NQ">NQ · Nasdaq</option>
                <option value="CL">CL · Crude Oil</option><option value="GC">GC · Gold</option>
              </optgroup>
              <optgroup label="Micro">
                <option value="MES">MES · Micro S&P</option><option value="MNQ">MNQ · Micro NQ</option>
                <option value="MCL">MCL · Micro CL</option><option value="MGC">MGC · Micro GC</option>
              </optgroup>
            </select>
          </div>
          <div><label style={fieldLabel}>Date</label>
            <input type="date" value={form.trade_date} onChange={e => set('trade_date', e.target.value)} />
          </div>
          <div><label style={fieldLabel}>Time</label>
            <input type="time" value={form.entry_time} onChange={e => set('entry_time', e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={fieldLabel}>Direction</label>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border2)' }}>
            {['long','short'].map(d => (
              <button key={d} onClick={() => set('direction', d)}
                className={form.direction === d ? (d === 'long' ? 'direction-long' : 'direction-short') : 'direction-inactive'}
                style={{ flex: 1, padding: '7px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
                  borderRight: d === 'long' ? '1px solid var(--border2)' : 'none' }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={grid3}>
          <div><label style={fieldLabel}>Entry price</label>
            <input type="number" placeholder="0.00" step="0.25" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} />
          </div>
          <div><label style={fieldLabel}>Exit price</label>
            <input type="number" placeholder="0.00" step="0.25" value={form.exit_price} onChange={e => set('exit_price', e.target.value)} />
          </div>
          <div><label style={fieldLabel}>Contracts</label>
            <input type="number" min="1" step="1" value={form.contracts} onChange={e => set('contracts', e.target.value)} />
          </div>
        </div>

        <div className="card-inner" style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Est. P&L {isMicro && <span style={{ color: '#EF9F27', marginLeft: 6 }}>MICRO</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>
              {ticks !== null ? `${ticks} ticks × $${TICK[form.instrument].value} × ${form.contracts}ct` : 'enter prices'}
            </div>
          </div>
          <div className={pnl === null ? '' : pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}
            style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: pnl === null ? 'var(--muted2)' : undefined }}>
            {pnl === null ? '—' : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
        <div style={sectionLabel}>Setup</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SETUPS.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={selectedTags.includes(tag) ? 'pill-active' : 'pill-inactive'}>{tag}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
        <div style={sectionLabel}>Emotion</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOTIONS.map(e => (
            <button key={e} onClick={() => set('emotion', form.emotion === e ? '' : e)} className={form.emotion === e ? 'pill-active' : 'pill-inactive'}>
              {e.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
        <div style={sectionLabel}>Chart screenshot</div>
        {existingScreenshot && !removeScreenshot && !screenshotFile && (
          <div style={{ marginBottom: 10 }}>
            <img src={existingScreenshot.url} alt="Current chart" style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 8 }} />
            <button onClick={() => setRemoveScreenshot(true)} className="btn-ghost"
              style={{ width: '100%', padding: '6px', fontSize: 11, color: 'var(--red)', borderColor: '#2a0000' }}>
              REMOVE SCREENSHOT
            </button>
          </div>
        )}
        {(removeScreenshot || !existingScreenshot || screenshotFile) && (
          <div onClick={() => document.getElementById('edit-screenshot-input').click()} style={{
            border: `1px dashed ${screenshotFile ? 'var(--blue)' : 'var(--border2)'}`,
            borderRadius: 6, padding: '14px', textAlign: 'center', cursor: 'pointer', fontSize: 11,
            color: screenshotFile ? 'var(--blue-text)' : 'var(--muted)',
            background: screenshotFile ? 'var(--blue-dim)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            {screenshotFile ? `✓ ${screenshotFile.name}` : 'Click to upload new screenshot'}
            <input id="edit-screenshot-input" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { setScreenshotFile(e.target.files[0]); setRemoveScreenshot(false) }} />
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '12px 14px', marginBottom: 8 }}>
        <div style={sectionLabel}>Notes</div>
        <textarea placeholder="What went well? What would you do differently?"
          value={form.notes} onChange={e => set('notes', e.target.value)}
          style={{ width: '100%', height: 72, resize: 'vertical', background: 'transparent', border: 'none', padding: 0, fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font)', outline: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn-ghost" onClick={() => navigate(`/trade/${id}`)} style={{ padding: '9px 16px' }}>CANCEL</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}
          style={{ flex: 1, padding: '9px', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>
    </div>
  )
}