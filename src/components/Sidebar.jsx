import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const NAV = [
  {
    section: 'Trading',
    items: [
      { label: 'Journal', icon: '◧', path: '/' },
      { label: 'Analytics', icon: '◈', path: '/analytics' },
    ]
  },
  {
    section: 'Markets',
    items: [
      { label: 'Sector Heatmap', icon: '▦', path: '/sectors' },
      { label: 'Stock Movers', icon: '▣', path: '/movers' },
      { label: 'Fundamentals', icon: '◉', path: '/fundamentals' },
      { label: 'Econ Calendar', icon: '◷', path: '/calendar' },
    ]
  },
  {
    section: 'Intelligence',
    items: [
      { label: 'News Feed', icon: '◎', path: '/news' },
      { label: 'AI Assistant', icon: '◬', path: '/ai' },
    ]
  },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={{
      width: collapsed ? 48 : 200,
      minWidth: collapsed ? 48 : 200,
      background: 'linear-gradient(180deg, #0f0f0f 0%, #080808 100%)',
      borderRight: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s, min-width 0.2s',
      overflow: 'hidden',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}>
        {!collapsed && (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            FUTURES TERMINAL
          </span>
        )}
        <button onClick={() => setCollapsed(p => !p)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
          fontSize: 16, padding: 2, flexShrink: 0, marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0,
        }}>☰</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 12px 4px', fontWeight: 600 }}>
                {section}
              </div>
            )}
            {items.map(({ label, icon, path }) => {
              const active = location.pathname === path
              return (
                <div key={path} onClick={() => navigate(path)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  cursor: 'pointer',
                  borderLeft: active ? '2px solid var(--blue)' : '2px solid transparent',
                  background: active ? 'var(--blue-dim)' : 'transparent',
                  color: active ? 'var(--blue-text)' : 'var(--muted)',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#f0f0f0' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? 'var(--blue-text)' : 'var(--muted)' }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center' }}>{icon}</span>
                  {!collapsed && <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, letterSpacing: '0.03em' }}>{label}</span>}
                </div>
              )
            })}
            {!collapsed && <div style={{ height: 4 }} />}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1a1a1a', padding: collapsed ? '10px 0' : '10px 12px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <button onClick={handleSignOut} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: collapsed ? 15 : 11,
          letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font)',
        }}>
          <span>⏻</span>
          {!collapsed && <span>SIGN OUT</span>}
        </button>
      </div>
    </div>
  )
}