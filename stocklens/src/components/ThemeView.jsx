import { useState } from 'react'
import { useStockData } from '../hooks/useStockData.js'
import StockCard from './StockCard.jsx'
import Scorecard from './Scorecard.jsx'
import ThemeMetrics from './ThemeMetrics.jsx'
import LoadingBar from './LoadingBar.jsx'

const SORT_OPTIONS = [
  { value: 'return12m', label: '12M Return' },
  { value: 'changePct', label: 'Day %' },
  { value: 'rsi',       label: 'RSI' },
  { value: 'ticker',    label: 'Ticker A–Z' },
]

export default function ThemeView({ stocks, themeName }) {
  const { data, loading, progress, refresh } = useStockData(stocks)
  const [view, setView]     = useState('cards') // 'cards' | 'scorecard'
  const [sort, setSort]     = useState('return12m')
  const [sortDir, setSortDir] = useState(-1)

  const loaded = Object.values(data).filter(Boolean).length

  function sortedStocks() {
    return [...stocks].sort((a, b) => {
      const ma = data[a.ticker], mb = data[b.ticker]
      if (!ma && !mb) return 0
      if (!ma) return 1
      if (!mb) return -1
      if (sort === 'ticker') return a.ticker.localeCompare(b.ticker) * sortDir
      const va = ma[sort] ?? -Infinity
      const vb = mb[sort] ?? -Infinity
      return (va - vb) * sortDir
    })
  }

  if (!stocks.length) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 8 }}>No stocks in this theme yet</div>
        <div style={{ fontSize: 12 }}>Add tickers to the config file to get started</div>
      </div>
    )
  }

  return (
    <div>
      {/* Zone 1 — Metric summary cards */}
      <ThemeMetrics stocks={stocks} data={data} themeName={themeName} />

      {/* Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['cards', 'scorecard'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12,
                fontFamily: 'var(--font-display)', letterSpacing: '0.03em',
                background: view === v ? 'var(--accent)' : 'var(--bg-card2)',
                color: view === v ? '#fff' : 'var(--text-secondary)',
                border: `0.5px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {v === 'cards' ? 'Cards' : 'Scorecard'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view === 'cards' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sort:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  background: 'var(--bg-card2)', border: '0.5px solid var(--border)',
                  color: 'var(--text-primary)', borderRadius: 6, padding: '4px 8px',
                  fontSize: 12, fontFamily: 'var(--font-body)',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                onClick={() => setSortDir(d => -d)}
                style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 12,
                  background: 'var(--bg-card2)', border: '0.5px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {sortDir === -1 ? '↓' : '↑'}
              </button>
            </div>
          )}
          <button
            onClick={refresh}
            style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12,
              background: 'var(--bg-card2)', border: '0.5px solid var(--border)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-display)',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Zone 2 & 3 — Loading bar or content */}
      {loading && loaded === 0 ? (
        <LoadingBar progress={progress} total={stocks.length} loaded={loaded} />
      ) : (
        <>
          {view === 'scorecard' ? (
            <Scorecard stocks={stocks} data={data} />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {sortedStocks().map(stock => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  metrics={data[stock.ticker]}
                  loading={loading && !data[stock.ticker]}
                />
              ))}
            </div>
          )}
          {loading && loaded > 0 && (
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading remaining stocks… {loaded}/{stocks.length}
            </div>
          )}
        </>
      )}
    </div>
  )
}
