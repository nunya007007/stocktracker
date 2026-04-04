export default function ThemeMetrics({ stocks, data, themeName }) {
  const entries = stocks.map(s => data[s.ticker]).filter(Boolean)
  if (!entries.length) return null

  const avg12m = entries.reduce((a, b) => a + (b.return12m ?? 0), 0) / entries.length
  const avgRSI = entries.reduce((a, b) => a + (b.rsi ?? 50), 0) / entries.length
  const ewIndex = parseFloat((100 * (1 + avg12m / 100)).toFixed(1))
  const bullCount = entries.filter(e => e.trend === 'Bullish').length
  const bearCount = entries.filter(e => e.trend === 'Bearish').length
  const trend = bullCount > bearCount ? 'Bullish' : bearCount > bullCount ? 'Bearish' : 'Neutral'

  const metrics = [
    { label: 'EW Index Level', value: ewIndex.toFixed(1), color: 'var(--blue-text)' },
    { label: '12M Return (avg)', value: `${avg12m >= 0 ? '+' : ''}${avg12m.toFixed(2)}%`, color: avg12m >= 0 ? 'var(--green-text)' : 'var(--red-text)' },
    { label: 'RSI(14) avg', value: avgRSI.toFixed(1), color: avgRSI > 70 ? 'var(--red-text)' : avgRSI < 30 ? 'var(--blue-text)' : 'var(--text-primary)' },
    {
      label: 'Trend Status',
      value: trend,
      color: trend === 'Bullish' ? 'var(--green-text)' : trend === 'Bearish' ? 'var(--red-text)' : 'var(--amber-text)',
    },
    { label: 'Stocks loaded', value: `${entries.length} / ${stocks.length}`, color: 'var(--text-secondary)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }}>
            {m.label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: m.color, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-display)' }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
