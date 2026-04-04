export default function PortfolioView() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--bg-card2)', border: '0.5px solid var(--border)',
        margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>
        ◈
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
        Portfolio
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
        Your portfolio positions will appear here. Add your holdings to the{' '}
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', background: 'var(--bg-card2)', padding: '1px 6px', borderRadius: 4 }}>
          portfolio
        </code>{' '}
        array in{' '}
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', background: 'var(--bg-card2)', padding: '1px 6px', borderRadius: 4 }}>
          src/data/config.js
        </code>
        {' '}to get started.
      </div>
      <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: 420, margin: '24px auto 0', textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 2 }}>
          <div style={{ color: 'var(--text-muted)' }}>// Example entry in config.js</div>
          <div><span style={{ color: 'var(--green-text)' }}>"portfolio"</span>: {'['}</div>
          <div style={{ paddingLeft: 16 }}>{'{'}</div>
          <div style={{ paddingLeft: 32 }}><span style={{ color: 'var(--blue-text)' }}>"ticker"</span>: <span style={{ color: 'var(--amber-text)' }}>"NVDA"</span>,</div>
          <div style={{ paddingLeft: 32 }}><span style={{ color: 'var(--blue-text)' }}>"name"</span>: <span style={{ color: 'var(--amber-text)' }}>"Nvidia"</span>,</div>
          <div style={{ paddingLeft: 32 }}><span style={{ color: 'var(--blue-text)' }}>"subSector"</span>: <span style={{ color: 'var(--amber-text)' }}>"GPU / AI"</span>,</div>
          <div style={{ paddingLeft: 32 }}><span style={{ color: 'var(--blue-text)' }}>"shares"</span>: <span style={{ color: 'var(--accent)' }}>10</span>,</div>
          <div style={{ paddingLeft: 32 }}><span style={{ color: 'var(--blue-text)' }}>"avgCost"</span>: <span style={{ color: 'var(--accent)' }}>620.00</span></div>
          <div style={{ paddingLeft: 16 }}>{'}'}</div>
          <div>{']'}</div>
        </div>
      </div>
    </div>
  )
}
