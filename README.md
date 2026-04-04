# StockLens Dashboard

Personal stock monitoring dashboard — theme-based watchlist with live indicators, TradingView charts, and portfolio tracking.

## Stack
- React + Vite (frontend)
- Finnhub.io (free market data API — 60 calls/min, no daily cap)
- TradingView Lightweight Charts (sparklines)
- TradingView widget (expanded charts)
- Vercel (hosting)

---

## Setup

### 1. Get a free Finnhub API key
1. Go to [finnhub.io](https://finnhub.io) and sign up (free, no credit card)
2. Copy your API key from the dashboard

### 2. Add your API key
Open `src/data/config.js` and replace:
```js
finnhubApiKey: "YOUR_FINNHUB_API_KEY"
```
with your actual key.

### 3. Install and run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

---

## Adding your tickers

Edit `src/data/config.js`. Each stock entry looks like:
```js
{ ticker: "NVDA", name: "Nvidia", exchange: "US / NASDAQ", subSector: "", source: "" }
```

Fill in `subSector` and `source` whenever you're ready — leave blank for now.

### International ticker formats
| Exchange | Format | Example |
|---|---|---|
| Japan TSE | NUMBER.T | 4062.T |
| Germany XETRA | TICKER.DE | IFX.DE |
| France Euronext | TICKER.PA | HO.PA |
| Netherlands Euronext | TICKER.AS | BESI.AS |

### Adding portfolio positions
In the `portfolio` array in `config.js`:
```js
{
  ticker: "NVDA",
  name: "Nvidia",
  exchange: "US / NASDAQ",
  subSector: "GPU / AI chips",
  source: "",
  shares: 10,
  avgCost: 620.00
}
```

---

## Deploy to Vercel

### Option A — Via GitHub (recommended)
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — hit Deploy
4. Your live URL appears instantly

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## Indicators computed (all from Finnhub OHLCV candles)
- RSI(14) — Wilder's smoothing method
- MACD (12,26,9) — EMA difference + signal line
- 50-day SMA
- 200-day SMA + slope direction (▲/▼)
- 52-week high/low range + distance from high
- Volume vs 20-day average
- 12-month return
- Trend status (Bullish / Neutral / Bearish)
- 20-day support & resistance

## Notes
- Data is cached for 5 minutes to minimise API calls
- International tickers (Japan, Europe) poll every 60s; US stocks have real-time WebSocket available
- The TradingView chart modal uses your existing TradingView subscription automatically
- For informational purposes only — not investment advice
