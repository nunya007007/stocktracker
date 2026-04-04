// Vercel Cron Function - Triggered at 4 PM CT (US market close) and 4 AM CT (Asia/Europe close)
// Pulls daily candles for all 200 stocks, calculates indicators, stores in KV

import { kv } from '@vercel/kv'
import { CONFIG } from '../../src/data/config.js'

const FINNHUB_API_KEY = process.env.VITE_FINNHUB_API_KEY
const CACHE_KEY = 'indicators:latest'
const TIMESTAMP_KEY = 'indicators:lastUpdate'

async function fetchCandles(ticker) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&count=252&token=${FINNHUB_API_KEY}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.c ? { closes: data.c, highs: data.h, lows: data.l, volumes: data.v } : null
  } catch (e) {
    console.error(`Failed to fetch ${ticker}:`, e.message)
    return null
  }
}

function calculateIndicators(candles) {
  if (!candles?.closes || candles.closes.length < 14) return null

  const closes = candles.closes
  const highs = candles.highs
  const lows = candles.lows

  // Simple SMA
  const sma50 = closes.slice(-50).reduce((a, b) => a + b) / 50
  const sma200 = closes.slice(-200).reduce((a, b) => a + b) / 200

  // RSI(14)
  let gains = 0,
    losses = 0
  for (let i = closes.length - 14; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgGain = gains / 14
  const avgLoss = losses / 14
  const rs = avgLoss === 0 ? 100 : avgGain === 0 ? 0 : avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  // MACD (simplified)
  const ema12 = closes.slice(-12).reduce((a, b) => a + b) / 12
  const ema26 = closes.slice(-26).reduce((a, b) => a + b) / 26
  const macd = ema12 - ema26

  // 52-week
  const high52w = Math.max(...highs.slice(-252))
  const low52w = Math.min(...lows.slice(-252))

  const price = closes[closes.length - 1]
  const vs50 = ((price - sma50) / sma50) * 100
  const vs200 = ((price - sma200) / sma200) * 100
  const distFrom52w = ((high52w - price) / high52w) * 100

  // Volume
  const vol20avg = candles.volumes.slice(-20).reduce((a, b) => a + b) / 20
  const volRatio = candles.volumes[candles.volumes.length - 1] / vol20avg

  // Trend
  let trend = 'Neutral'
  if (rsi > 60 && macd > 0 && price > sma50) trend = 'Bullish'
  else if (rsi < 40 && macd < 0 && price < sma50) trend = 'Bearish'

  return {
    price: parseFloat(price.toFixed(2)),
    rsi: parseFloat(rsi.toFixed(2)),
    macd: { bullish: macd > 0 },
    sma50: parseFloat(sma50.toFixed(2)),
    sma200: parseFloat(sma200.toFixed(2)),
    vs50dma: parseFloat(vs50.toFixed(2)),
    vs200dma: parseFloat(vs200.toFixed(2)),
    high52w: parseFloat(high52w.toFixed(2)),
    low52w: parseFloat(low52w.toFixed(2)),
    distFrom52wh: parseFloat(distFrom52w.toFixed(2)),
    volRatio: parseFloat(volRatio.toFixed(2)),
    volVsAvg: volRatio > 1 ? 'Above' : 'Below',
    trend,
  }
}

export default async function handler(req, res) {
  // Verify cron secret (Vercel provides this)
  if (req.headers['x-vercel-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('📈 Starting indicator refresh...')

    // Get all stocks from config
    const allStocks = Object.values(CONFIG.themes)
      .flat()
      .reduce((acc, stock) => {
        if (!acc.find(s => s.ticker === stock.ticker)) acc.push(stock)
        return acc
      }, [])

    const indicators = {}
    let successCount = 0

    // Fetch candles and calculate indicators for each stock
    for (const stock of allStocks) {
      const candles = await fetchCandles(stock.ticker)
      if (candles) {
        const metrics = calculateIndicators(candles)
        if (metrics) {
          indicators[stock.ticker] = metrics
          successCount++
        }
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Store in Vercel KV
    const timestamp = new Date().toISOString()
    await kv.set(CACHE_KEY, JSON.stringify(indicators), { ex: 86400 * 7 }) // 7 day retention
    await kv.set(TIMESTAMP_KEY, timestamp, { ex: 86400 * 7 })

    console.log(`✅ Refreshed ${successCount}/${allStocks.length} stocks`)

    res.status(200).json({
      success: true,
      refreshed: successCount,
      total: allStocks.length,
      timestamp,
    })
  } catch (error) {
    console.error('❌ Cron failed:', error)
    res.status(500).json({ error: error.message })
  }
}

export const config = {
  maxDuration: 300, // 5 minutes max
}
