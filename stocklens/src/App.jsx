import { useState } from 'react'
import { CONFIG } from './data/config.js'
import ThemeView from './components/ThemeView.jsx'
import PortfolioView from './components/PortfolioView.jsx'
import './index.css'

const THEME_NAMES = Object.keys(CONFIG.themes)
const ALL_TABS = [...THEME_NAMES, 'Portfolio']

export default function App() {
  const [activeTab, setActiveTab] = useState(THEME_NAMES[0])

  const stocks = activeTab !== 'Portfolio' ? (CONFIG.themes[activeTab] ?? []) : []

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52,
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg-card)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)',
          }}>S</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em' }}>
            StockLens
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
          }} />
        </div>
      </header>

      {/* Tab navigation */}
      <nav style={{
        display: 'flex', overflowX: 'auto', gap: 2,
        padding: '8px 24px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg-card)',
        scrollbarWidth: 'none',
      }}>
        {ALL_TABS.map(tab => {
          const isActive = activeTab === tab
          const isEmpty = tab !== 'Portfolio' && CONFIG.themes[tab]?.length === 0
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 6,
                fontFamily: 'var(--font-display)', fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : isEmpty ? 'var(--text-muted)' : 'var(--text-secondary)',
                border: `0.5px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                transition: 'all 0.15s',
                opacity: isEmpty && !isActive ? 0.5 : 1,
              }}
              title={isEmpty ? 'No stocks configured yet' : tab}
            >
              {tab}
              {!isEmpty && tab !== 'Portfolio' && (
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                  {CONFIG.themes[tab].length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 1600, width: '100%', margin: '0 auto' }}>
        {activeTab === 'Portfolio' ? (
          <PortfolioView />
        ) : (
          <div key={activeTab} className="fade-in">
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
                {activeTab}
              </h1>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {stocks.length} stocks
              </span>
            </div>
            <ThemeView stocks={stocks} themeName={activeTab} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '12px 24px', borderTop: '0.5px solid var(--border)',
        fontSize: 11, color: 'var(--text-muted)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>StockLens · Data via Finnhub.io · Charts via TradingView</span>
        <span>For informational purposes only · Not investment advice</span>
      </footer>
    </div>
  )
}
