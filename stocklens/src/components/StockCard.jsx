import { useState } from 'react'
import Sparkline from './Sparkline.jsx'
import TVChartModal from './TVChartModal.jsx'

function TrendPill({ trend }) {
  const cls = trend === 'Bullish' ? 'pill pill-bull' : trend === 'Bearish' ? 'pill pill-bear' : 'pill pill-neut'
  return <span className={cls}>{trend}</span>
}

function MACDPill({ macd }) {
  if (!macd) return <span className="pill pill-neut">—</span>
  return <span className={macd.bullish ? 'pill pill-bull' : 'pill pill-bear'}>{macd.bullish ? 'Bullish' : 'Bearish'}</span>
}

function RSIValue({ rsi }) {
  if (rsi === null || rsi === undefined) return <span className="muted">—</span>
  const color = rsi > 70 ? 'var(--red-text)' : rsi < 30 ? 'var(--blue-text)' : 'var(--text-primary)'
  return <span style={{ color }} className="tabnum">{rsi.toFixed(1)}</span>
}

function MetricRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '0.5px solid var(--border)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{label}</span>
      <span style={{ color: valueColor || 'var(--text-primary)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</span>
    </div>
  )
}

function pctColor(v) { return v === null || v === undefined ? undefined : v >= 0 ? 'var(--green-text)' : 'var(--red-text)' }
function fmt(v, dp = 2) { return v === null || v === undefined ? '—' : v.toFixed(dp) }
function fmtPct(v) { return v === null || v === undefined ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` }
function fmtPrice(v) { return v === null || v === undefined ? '—' : v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v.toFixed(2) }
function fmtVol(v) { if (!v) return '—'; if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`; if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`; return v }

export default function StockCard({ stock, metrics, loading }) {
  const [modal, setModal] = useState(false)

  if (loading || !metrics) {
    return (
      <div className="card" style={{ opacity: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div className="skeleton" style={{ width: 60, height: 16, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 120, height: 12 }} />
          </div>
          <div className="skeleton" style={{ width: 70, height: 28 }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: 48, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '100%', height: 80 }} />
      </div>
    )
  }

  const { price, changePct, change, rsi, macd, trend, vs50dma, vs200dma, distFrom52wh, lastVol, volAvg, volVsAvg, sparkline, return12m, range52 } = metrics
  const positive = changePct >= 0

  return (
    <>
      <div
        className="card fade-in"
        onClick={() => setModal(true)}
        style={{ cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 14, letterSpacing: '0.04em' }}>{stock.ticker}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 1 }}>{stock.name}</div>
            {/* Tags */}
            <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
              <span className="pill pill-exch" style={{ fontSize: 10 }}>{stock.exchange}</span>
              {stock.subSector && <span className="pill" style={{ background: '#1e2235', color: '#7b8fd4', border: '0.5px solid #2d3354', fontSize: 10 }}>{stock.subSector}</span>}
              {stock.source && <span className="pill" style={{ background: '#1e2a1e', color: '#5a9e6f', border: '0.5px solid #2a3f2a', fontSize: 10 }}>{stock.source}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500 }}>{fmtPrice(price)}</div>
            <div style={{ color: positive ? 'var(--green-text)' : 'var(--red-text)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
              {positive ? '+' : ''}{fmtPct(changePct)}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ margin: '8px 0' }}>
          <Sparkline data={sparkline} positive={positive} height={44} />
        </div>

        {/* 52W Range bar */}
        {range52 && (
          <div style={{ margin: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>
              <span>{fmtPrice(range52.low)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>52W range</span>
              <span>{fmtPrice(range52.high)}</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-card2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max(0, Math.min(100, ((price - range52.low) / (range52.high - range52.low)) * 100))}%`,
                background: positive ? 'var(--green)' : 'var(--accent)',
                borderRadius: 2,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Indicators grid */}
        <div style={{ marginTop: 8, borderTop: '0.5px solid var(--border)', paddingTop: 8 }}>
          <MetricRow label="RSI(14)" value={<RSIValue rsi={rsi} />} />
          <MetricRow label="Trend" value={<TrendPill trend={trend} />} />
          <MetricRow label="MACD" value={<MACDPill macd={macd} />} />
          <MetricRow label="vs 50 DMA" value={fmtPct(vs50dma)} valueColor={pctColor(vs50dma)} />
          <MetricRow label="vs 200 DMA" value={fmtPct(vs200dma)} valueColor={pctColor(vs200dma)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '0.5px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>Volume</span>
            <span style={{ fontSize: 11, color: volVsAvg === 'Above' ? 'var(--green-text)' : 'var(--text-secondary)' }}>
              {fmtVol(lastVol)} <span style={{ color: 'var(--text-muted)' }}>/ {fmtVol(volAvg)} avg</span>
            </span>
          </div>
          <MetricRow label="12M return" value={fmtPct(return12m)} valueColor={pctColor(return12m)} />
        </div>

        {/* Click hint */}
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', marginTop: 6 }}>
          click for full chart →
        </div>
      </div>

      {modal && <TVChartModal ticker={stock.ticker} name={stock.name} onClose={() => setModal(false)} />}
    </>
  )
}
