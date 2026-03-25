export default function ComingSoon({ title, icon, desc }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: 16 }}>
      <div style={{ fontSize: 40, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 400, lineHeight: 1.7 }}>{desc}</div>
      <div style={{ fontSize: 11, color: 'var(--muted2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8, border: '1px solid #1e1e1e', padding: '6px 14px', borderRadius: 6 }}>Coming Soon</div>
    </div>
  )
}