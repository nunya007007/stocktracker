import { useState } from 'react'

function TrendPill({ trend }) {
  const cls = trend === 'Bullish' ? 'pill pill-bull' : trend === 'Bearish' ? 'pill pill-bear' : 'pill pill-neut'
  return <span className={cls}>{trend ?? '—'}</span>
}
function MACDPill({ macd }) {
  if (!macd) return <span className="pill pill-neut">—</span>
  return <span className={macd.bullish ? 'pill pill-bull' : 'pill pill-bear'}>{macd.bullish ? 'Bullish' : 'Bearish'}</span>
}

function pct(v) {
  if (v === null || v === undefined) return { text: '—', color: 'var(--text-muted)' }
  return { text: `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, color: v >= 0 ? 'var(--green-text)' : 'var(--red-text)' }
}

function RSICell({ rsi }) {
  if (rsi === null || rsi === undefined) return <td style={tdStyle}>—</td>
  const color = rsi > 70 ? 'var(--red-text)' : rsi < 30 ? 'var(--blue-text)' : 'var(--text-primary)'
  return <td style={{ ...tdStyle, color }}>{rsi.toFixed(1)}</td>
}

const thStyle = {
  padding: '8px 10px', fontSize: 11, fontWeight: 500,
  color: 'var(--text-secondary)', textAlign: 'left',
  borderBottom: '0.5px solid var(--border)',
  background: 'var(--bg-card2)', cursor: 'pointer',
  whiteSpace: 'nowrap', userSelect: 'none',
  fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
}
const tdStyle = {
  padding: '7px 10px', fontSize: 12, fontVariantNumeric: 'tabular-nums',
  borderBottom: '0.5px solid var(--border)', whiteSpace: 'nowrap',
  color: 'var(--text-primary)',
}

const COLS = [
  { key: 'ticker',     label: 'Ticker' },
  { key: 'return12m',  label: '12M Ret' },
  { key: 'price',      label: 'Price' },
  { key: 'changePct',  label: 'Day %' },
  { key: 'rsi',        label: 'RSI(14)' },
  { key: 'trend',      label: 'Trend' },
  { key: 'vs50dma',    label: 'vs 50DMA' },
  { key: 'vs200dma',   label: 'vs 200DMA' },
  { key: 'distFrom52wh', label: 'Dist 52WH' },
  { key: 'macd',       label: 'MACD' },
  { key: 'volVsAvg',   label: 'Vol vs Avg' },
]

function sortVal(row, key) {
  const m = row.metrics
  if (!m) return -Infinity
  if (key === 'ticker') return row.stock.ticker
  if (key === 'trend') return m.trend === 'Bullish' ? 2 : m.trend === 'Neutral' ? 1 : 0
  if (key === 'macd') return m.macd?.bullish ? 1 : 0
  if (key === 'volVsAvg') return m.volVsAvg === 'Above' ? 1 : 0
  return m[key] ?? -Infinity
}

export default function Scorecard({ stocks, data }) {
  const [sortKey, setSortKey] = useState('return12m')
  const [sortDir, setSortDir] = useState(-1)

  const rows = stocks.map(stock => ({ stock, metrics: data[stock.ticker] }))
  rows.sort((a, b) => {
    const av = sortVal(a, sortKey), bv = sortVal(b, sortKey)
    if (typeof av === 'string') return av.localeCompare(bv) * sortDir
    return (av - bv) * sortDir
  })

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  function fmtPrice(v) {
    if (!v) return '—'
    return v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v.toFixed(2)
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead>
          <tr>
            {COLS.map(col => (
              <th key={col.key} style={thStyle} onClick={() => handleSort(col.key)}>
                {col.label} {sortKey === col.key ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ stock, metrics: m }, i) => {
            const r12 = pct(m?.return12m)
            const day = pct(m?.changePct)
            const v50 = pct(m?.vs50dma)
            const v200 = pct(m?.vs200dma)
            const d52 = pct(m?.distFrom52wh)
            return (
              <tr key={stock.ticker} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={tdStyle}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{stock.ticker}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{stock.name}</div>
                </td>
                <td style={{ ...tdStyle, color: r12.color }}>{r12.text}</td>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>{fmtPrice(m?.price)}</td>
                <td style={{ ...tdStyle, color: day.color }}>{day.text}</td>
                <RSICell rsi={m?.rsi} />
                <td style={tdStyle}><TrendPill trend={m?.trend} /></td>
                <td style={{ ...tdStyle, color: v50.color }}>{v50.text}</td>
                <td style={{ ...tdStyle, color: v200.color }}>{v200.text}</td>
                <td style={{ ...tdStyle, color: d52.color }}>{d52.text}</td>
                <td style={tdStyle}><MACDPill macd={m?.macd} /></td>
                <td style={{ ...tdStyle, color: m?.volVsAvg === 'Above' ? 'var(--green-text)' : 'var(--text-secondary)' }}>
                  {m?.volVsAvg ?? '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
