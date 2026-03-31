import { useState, useRef } from 'react'
import { parseDailyStatement } from '../utils/parseDailyStatement'

export default function ImportPDF({ onImport }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }
    setLoading(true)
    setError(null)
    setPreview(null)

    try {
      // Load PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs'

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
      }

      console.log('RAW PDF TEXT:', fullText)
      let result
      try {
        result = parseDailyStatement(fullText)
      } catch (parseErr) {
        console.error('Parse error:', parseErr)
        setError(`Parse error: ${parseErr.message}`)
        setLoading(false)
        return
      }
      if (result.error) {
        setError(result.error)
      } else {
        setPreview(result)
      }
    } catch (err) {
      setError(`Failed to parse PDF: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={e => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="btn-primary"
        style={{ padding: '6px 14px', fontSize: 12 }}
      >
        {loading ? 'PARSING...' : '📄 IMPORT PDF'}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#1a0000', border: '1px solid #600000', borderRadius: 6, color: '#ff6060', fontSize: 13 }}>
          {error}
        </div>
      )}

      {preview && (
        <div style={{ marginTop: 16, background: 'linear-gradient(160deg,#111,#0a0a0a)', border: '1px solid #1e1e1e', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Preview — {preview.trades.length} trade{preview.trades.length > 1 ? 's' : ''} found
          </div>

          {preview.trades.map((t, i) => (
            <div key={i} style={{ marginBottom: 12, padding: '10px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>DATE</div>
                  <div style={{ fontSize: 13, color: '#e0e0e0' }}>{t.trade_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>INSTRUMENT</div>
                  <div style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 700 }}>{t.instrument}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>DIRECTION</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.direction === 'long' ? '#70c0ff' : '#ff6060' }}>
                    {t.direction.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>CONTRACTS</div>
                  <div style={{ fontSize: 13, color: '#e0e0e0' }}>{t.contracts}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>ENTRY AVG</div>
                  <div style={{ fontSize: 13, color: '#e0e0e0' }}>{t.entry_price}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>EXIT AVG</div>
                  <div style={{ fontSize: 13, color: '#e0e0e0' }}>{t.exit_price}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>P&L</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.pnl >= 0 ? '#70c0ff' : '#ff6060' }}>
                    {t.pnl >= 0 ? '+' : ''}${t.pnl?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>FEES</div>
                  <div style={{ fontSize: 13, color: '#888' }}>${t.fees?.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>{t.notes}</div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => { onImport(preview.trades); setPreview(null) }}
              className="btn-primary"
              style={{ padding: '8px 20px' }}
            >
              ✓ IMPORT {preview.trades.length} TRADE{preview.trades.length > 1 ? 'S' : ''}
            </button>
            <button
              onClick={() => setPreview(null)}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, color: '#888', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12 }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

