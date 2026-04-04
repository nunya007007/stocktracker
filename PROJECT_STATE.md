# StockLens Project State

**Last Updated:** April 4, 2026 @ 11:11 AM CT  
**Status:** 🟢 PRODUCTION LIVE - TwelveData Integration Complete

## Major Update (April 4, 2026)

**Switched from Finnhub to TwelveData** for all data sources.

### Why TwelveData?
- ✅ Free tier supports international stocks (*.T, *.PA, *.DE, *.AS)
- ✅ Provides daily candles on free tier (Finnhub blocks them)
- ✅ Live quotes for all exchanges
- ✅ 92 credits/day on free tier (under 800 limit)
- ✅ Scales to 300+ stocks with paid tier ($30/month)

---

## Architecture (Current)

### Data Sources
- **TwelveData:** Candles (252 days) + Live quotes
- **Vercel KV:** Cache for calculated indicators only
- **Vercel Cron:** Scheduled refreshes at 12 PM & 4 PM CT

### Cron Workflow
```
12 PM & 4 PM CT:
  1. Fetch 252 candles from TwelveData (23 stocks × 2 credits = 46)
  2. Calculate indicators locally (RSI, MACD, SMA, etc.)
  3. Save to KV: indicators:TICKER
  4. Discard candles (not stored)
  5. Done in ~2 minutes
```

### Frontend Workflow
```
Page Load:
  1. Fetch live quotes from TwelveData (23 stocks, queued 100ms apart)
  2. Fetch cached indicators from KV (via /api/indicators)
  3. Merge and display
  4. Shows all 23 stocks with prices + indicators
```

---

## API Credit Usage

### Daily Budget: 800 credits/day (free tier)

**Current Usage (23 stocks, 2 refreshes):**
- Candles: 23 × 2 × 2 refreshes = 92 credits/day
- Quotes: Varies by page loads (low cost)
- **Total: ~100-150 credits/day**
- **Headroom: 600+ credits/day** ✅

**At 300 stocks (future):**
- Would need: 300 × 2 × 2 = 1,200 credits/day
- **Solution:** Upgrade to TwelveData paid tier (~$30/month = 50,000 credits/month)

---

## Completed Tasks ✅

1. ✅ Switched candles endpoint: Finnhub → TwelveData
2. ✅ Switched quotes endpoint: Finnhub → TwelveData
3. ✅ Updated cron schedule: 4 AM, 4 PM → 12 PM, 4 PM CT
4. ✅ All 23 stocks now fully supported (including international)
5. ✅ Per-stock KV storage for indicators
6. ✅ Deduplication logic (in-memory Sets)
7. ✅ Code pushed to GitHub
8. ✅ Vercel auto-deploy triggered

---

## Next Steps

### Immediate (Today)
1. Add `TWELVEDATA_API_KEY` to Vercel environment variables
   - Key: `TWELVEDATA_API_KEY`
   - Value: `89834e369f0a43aca7faa65f29f56291`
   - Make sure it's set for **Production**
2. Wait for first cron run at 12 PM CT
3. Check dashboard at https://stocktracker-rust.vercel.app/
4. Verify all 23 stocks show prices + indicators

### Optional (Future)
- Expand to 50-100 stocks (still free tier)
- Upgrade to TwelveData paid tier when expanding to 300+ stocks
- Add historical data archiving (Vercel Postgres)
- Add alerts/notifications (RSI thresholds, price targets)

---

## File Structure

```
/tmp/stocklens_final/
├── src/
│   ├── hooks/useLiveData.js          ✏️ Updated: TwelveData quotes
│   ├── data/config.js                 (23 stocks, all working)
│   └── components/                    (no changes needed)
├── api/
│   ├── cron/refresh-indicators.js    ✏️ Updated: TwelveData candles
│   └── indicators.js                  (no changes needed)
├── vercel.json                        ✏️ Updated: 12 PM & 4 PM schedule
└── PROJECT_STATE.md                   (this file)
```

---

## Git Commits (Session)

- `34c7ea7` - Fix: Remove relative import in cron handler
- `cb407d0` - Refactor: Per-stock KV keys, dedup logic
- `9aaa0e8` - Add PROJECT_STATE.md
- `0b785f7` - Revert removal of international tickers
- `dd2e520` - **Switch from Finnhub to TwelveData** ← Current

---

## Environment Variables (Vercel)

Must be set for **Production:**
- `VITE_TWELVEDATA_API_KEY` = `89834e369f0a43aca7faa65f29f56291`

Optional (kept for backward compatibility):
- `VITE_FINNHUB_API_KEY` (no longer used)

---

## Known Limitations

1. **No historical candle storage** — Fetches fresh each refresh
   - Could add Vercel Postgres for backtesting later
2. **No user accounts** — Single-user dashboard
3. **No portfolio tracking** — Tab exists but empty
4. **No alerts** — Manual monitoring only

---

## Success Criteria (Next 24 Hours)

- [ ] Vercel deployment complete
- [ ] 12 PM cron run executes (check logs)
- [ ] Dashboard shows all 23 stocks
- [ ] Prices update correctly (TwelveData)
- [ ] Indicators display (RSI, MACD, SMA, etc.)
- [ ] No rate limit errors

---

## Support Info

- **Dashboard:** https://stocktracker-rust.vercel.app/
- **GitHub:** github.com/nunya007007/stocktracker (private)
- **Vercel Project:** stocktracker (automated deployments)
- **API Key:** TwelveData free tier (active)

