export default function LoadingBar({ progress, total, loaded }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 13,
        color: 'var(--text-secondary)', marginBottom: 16, letterSpacing: '0.05em',
      }}>
        LOADING MARKET DATA — {loaded} / {total} stocks
      </div>
      <div style={{
        width: '100%', maxWidth: 400, margin: '0 auto',
        height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'var(--accent)',
          borderRadius: 1,
          transition: 'width 0.3s ease',
          boxShadow: '0 0 8px var(--accent)',
        }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
        Rate-limited to respect Finnhub free tier
      </div>
    </div>
  )
}
