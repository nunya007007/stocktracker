// Mock data generator - produces realistic-looking stock data
// Remove this file and use real Finnhub API when ready to upgrade

function generateMockCandles(symbol) {
  const candles = []
  const now = Math.floor(Date.now() / 1000)
  let price = 100 + Math.random() * 200

  // Generate 252 candles (1 year of trading days) instead of 400
  for (let i = 252; i > 0; i--) {
    const timestamp = now - (i * 86400)
    const dailyChangePercent = (Math.random() - 0.5) * 4 // -2% to +2%
    const open = price
    const close = price * (1 + dailyChangePercent / 100)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.floor(50000000 + Math.random() * 100000000)

    candles.push({
      t: timestamp,
      o: parseFloat(open.toFixed(2)),
      c: parseFloat(close.toFixed(2)),
      h: parseFloat(high.toFixed(2)),
      l: parseFloat(low.toFixed(2)),
      v: volume,
    })

    price = close
  }

  return candles
}

function calculateMockMetrics(candles) {
  if (!candles || candles.length === 0) return null

  const closes = candles.map(c => c.c)
  const opens = candles.map(c => c.o)
  const highs = candles.map(c => c.h)
  const lows = candles.map(c => c.l)
  const volumes = candles.map(c => c.v)

  // Simple SMA calculation
  const sma50 = closes.slice(-50).reduce((a, b) => a + b) / 50
  const sma200 = closes.slice(-200).reduce((a, b) => a + b) / 200

  // Current price
  const currentPrice = closes[closes.length - 1]
  const previousPrice = closes[closes.length - 2]
  const dailyChange = currentPrice - previousPrice
  const dailyChangePercent = (dailyChange / previousPrice) * 100

  // Simple RSI calculation
  let gains = 0, losses = 0
  for (let i = closes.length - 14; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgGain = gains / 14
  const avgLoss = losses / 14
  const rs = avgGain / avgLoss
  const rsi = 100 - (100 / (1 + rs))

  // Simple MACD
  const ema12 = closes.slice(-12).reduce((a, b) => a + b) / 12
  const ema26 = closes.slice(-26).reduce((a, b) => a + b) / 26
  const macd = ema12 - ema26
  const signal = macd * 0.9 // simplified
  const histogram = macd - signal

  // 52-week high/low
  const weekRange = closes.slice(-252)
  const high52w = Math.max(...highs.slice(-252))
  const low52w = Math.min(...lows.slice(-252))
  const distFromHigh = ((high52w - currentPrice) / high52w) * 100

  // Volume average
  const vol20avg = volumes.slice(-20).reduce((a, b) => a + b) / 20
  const volRatio = volumes[volumes.length - 1] / vol20avg

  // 12-month return
  const year12Return = ((currentPrice - closes[Math.max(0, closes.length - 252)]) / closes[Math.max(0, closes.length - 252)]) * 100

  // Trend determination
  let trend = 'Neutral'
  if (rsi > 60 && macd > 0 && currentPrice > sma50) trend = 'Bullish'
  else if (rsi < 40 && macd < 0 && currentPrice < sma50) trend = 'Bearish'

  // Support & resistance (simple)
  const support = low52w + (high52w - low52w) * 0.25
  const resistance = high52w - (high52w - low52w) * 0.25

  return {
    price: parseFloat(currentPrice.toFixed(2)),
    changePct: parseFloat(dailyChangePercent.toFixed(2)),
    rsi: parseFloat(rsi.toFixed(2)),
    macd: { bullish: macd > 0 },
    signal: parseFloat(signal.toFixed(4)),
    histogram: parseFloat(histogram.toFixed(4)),
    sma50: parseFloat(sma50.toFixed(2)),
    sma200: parseFloat(sma200.toFixed(2)),
    sma200Slope: currentPrice > sma200 ? '▲' : '▼',
    high52w: parseFloat(high52w.toFixed(2)),
    low52w: parseFloat(low52w.toFixed(2)),
    distFrom52wh: parseFloat(distFromHigh.toFixed(2)),
    volRatio: parseFloat(volRatio.toFixed(2)),
    volVsAvg: volRatio > 1 ? 'Above' : 'Below',
    vs50dma: parseFloat(((currentPrice - sma50) / sma50 * 100).toFixed(2)),
    vs200dma: parseFloat(((currentPrice - sma200) / sma200 * 100).toFixed(2)),
    return12m: parseFloat(year12Return.toFixed(2)),
    trend: trend,
    support: parseFloat(support.toFixed(2)),
    resistance: parseFloat(resistance.toFixed(2)),
  }
}

export function getMockStockData(symbol) {
  const candles = generateMockCandles(symbol)
  const metrics = calculateMockMetrics(candles)
  return metrics
}

export function getMockAllStocks(stocks) {
  const result = {}
  stocks.forEach(stock => {
    result[stock.ticker] = getMockStockData(stock.ticker)
  })
  return result
}
