import Scorecard from './Scorecard.jsx'

export default function ThemeMetrics({ stocks, data, themeName, lastUpdate, onRefresh }) {
  if (!data || !stocks || stocks.length === 0) {
    return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading data...</div>
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  
  const entries = stocks.map(s => ({ stock: s, metrics: data[s.ticker] })).filter(e => e.metrics)
  if (!entries.length) return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No data available</div>

  const metricsData = entries.map(e => e.metrics)
  const avg12m = metricsData.reduce((a, b) => a + (b.return12m ?? 0), 0) / metricsData.length
  const avgRSI = metricsData.reduce((a, b) => a + (b.rsi ?? 50), 0) / metricsData.length
  const ewIndex = parseFloat((100 * (1 + avg12m / 100)).toFixed(1))
  const bullCount = metricsData.filter(e => e.trend === 'Bullish').length
  const bearCount = metricsData.filter(e => e.trend === 'Bearish').length
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
    <>
      {/* Timestamp + refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>Indicators updated: {formatTime(lastUpdate)}</span>
        <button
          onClick={onRefresh}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            color: 'var(--blue-text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.target.style.borderColor = 'var(--blue-text)'
            e.target.style.background = 'rgba(96, 165, 250, 0.1)'
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.background = 'transparent'
          }}
        >
          Refresh Prices
        </button>
      </div>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
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

      {/* Scorecard table */}
      <Scorecard stocks={stocks} data={data} />
    </>
  )
}
