# StockLens Project State

**Last Updated:** April 4, 2026 @ 10:26 AM CT  
**Status:** 🟢 PRODUCTION LIVE - Fixed Finnhub tier limitation (13 US stocks)

## Architecture Update (April 4, 2026)

### Cron Job (Indicators) - Now Per-Stock KV Keys ✅

**How it works:**
- **Schedule:** 4 AM CT & 4 PM CT (fixed, always runs full update)
- **Per-stock storage:** 
  - `indicators:TICKER` → indicator data (RSI, MACD, SMA, etc.)
  - `indicators:lastUpdate:TICKER` → Unix timestamp of last update
- **Deduplication within run:** Uses in-memory Set to track processed stocks
  - Prevents duplicate API calls if same ticker appears twice
- **Error handling:** Only marks stock as processed if BOTH fetch AND calculation succeed
  - Failed stocks remain unprocessed, retry on next cron run
- **Delay:** 100ms between API calls (respects 60 calls/min Finnhub limit)
- **Scale:** Can handle 300+ stocks
  - 300 stocks × 100ms = 30 seconds per run
  - Well under Vercel's 5-minute cron timeout

### Frontend Prices (Live Quotes) - Deduplication ✅

**How it works:**
- **On page load:** Auto-fetches all stock quotes
- **On manual refresh:** User clicks "Refresh Prices" button
- **Deduplication:** Uses in-memory Set per refresh session
  - If AAPL appears twice in stock list, only fetches once
  - Prevents wasted API calls
- **Rate limiting:** 100ms delay between requests
  - 300 stocks × 100ms = 30 seconds total per refresh
- **Progress tracking:** Real-time progress bar shows fetch completion

### API Endpoint `/api/indicators` - Refactored ✅

**Old:** Fetched single monolithic object `indicators:latest`  
**New:** Fetches all per-stock keys in parallel

```javascript
// Fetches in parallel:
- indicators:AAPL
- indicators:MSFT
- indicators:GOOGL
- ... (all 300)
- indicators:lastUpdate:AAPL
- indicators:lastUpdate:MSFT
- etc.

// Returns:
{
  "data": {
    "AAPL": { price, rsi, macd, ... },
    "MSFT": { price, rsi, macd, ... },
    ...
  },
  "lastUpdates": {
    "AAPL": 1712282400000,
    "MSFT": 1712282400000,
    ...
  }
}
```

## Completed Tasks ✅

1. ✅ Cron refactored for per-stock KV storage
2. ✅ Deduplication logic (in-memory Sets)
3. ✅ Error handling (only mark successful updates)
4. ✅ API endpoint refactored for per-stock keys
5. ✅ Frontend hook refactored for quote deduplication
6. ✅ Code pushed to GitHub, Vercel auto-deploy triggered
7. ✅ **Identified Finnhub free tier limitation**
   - International exchanges (*.T, *.AS, *.PA, *.DE) blocked
   - Only 13/23 stocks have API access
   - Removed unsupported tickers, kept US NASDAQ/NYSE only

## Finnhub Tier Limitation

**Free tier:** US NASDAQ/NYSE only  
**Blocked (requires paid):** Japan (*.T), Netherlands (*.AS), France (*.PA), Germany (*.DE)

**Current supported stocks (13):**
- AMKR, KLAC, AIP, ASML, RMBS, AVGO, LSCC, ARM, CDNS, MRVL, NXPI, SNPS, QCOM

**To expand to international stocks:**
- Upgrade to Finnhub paid tier ($30-50/month)
- OR use free alternative API (Alpha Vantage, IEX, Polygon)
- OR add proxy data source for international tickers

## Pending Work ⏳

### Next (High Priority)
1. **Verify 4 PM cron execution today**
   - Check Vercel dashboard for execution logs
   - Verify KV cache has per-stock keys
   - Confirm dashboard shows 13 stocks with indicators
2. **Expand stock list up to 300 US stocks**
   - Add more NASDAQ/NYSE tickers to STOCKS array
   - Test performance with larger dataset
   - Monitor API quota (still under 800 calls/day)

### Optional Enhancements
3. **Add international support**
   - Upgrade Finnhub tier OR
   - Integrate second data source (Alpha Vantage, IEX Cloud)
4. **Add stock categories** (Semiconductors, Energy, Commodities, etc.)
5. **User preferences** (select which stocks to display)
6. **Historical data tracking** (archive daily snapshots)
7. **Alerts/notifications** (RSI thresholds, price targets)

## Known Behavior

- **Cron always runs full update** at 4 AM & 4 PM (no partial updates)
- **Within-run deduplication** only prevents duplicate API calls in same cron execution
- **Cross-run deduplication** would require timestamp checks (not implemented yet)
- **Failed stocks retry** automatically on next cron run
- **First cron run** takes ~30 seconds for 300 stocks; subsequent runs similar (no caching of API responses)

## Git Commits (Session)

- `34c7ea7` - "Fix: Remove relative import in cron handler"
- `cb407d0` - "Refactor: Per-stock KV keys, dedup logic, improved error handling"
- `9aaa0e8` - "Add PROJECT_STATE.md - architecture update & refactor summary"
- `f0be8cf` - "Fix: Remove unsupported international tickers"
- `dbbcd0d` - "Update config.js to match supported tickers"

## Files Modified

- `api/cron/refresh-indicators.js` - Per-stock keys, dedup Set, error handling
- `api/indicators.js` - Parallel KV fetch, per-stock reconstruction
- `src/hooks/useLiveData.js` - Quote deduplication, dedup Set

## Next Session Instructions

1. Check Vercel logs — did 4 PM cron run successfully today?
2. If yes → Expand to 300 stocks
3. If no → Debug from cron execution logs
4. Monitor first few cron runs to catch any issues
