export function calcSMA(closes, period) {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

export function calcEMA(closes, period) {
  if (closes.length < period) return null
  const k = 2 / (period + 1)
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k)
  }
  return ema
}

export function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2))
}

export function calcMACD(closes, fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow + signal) return null
  const emaFast = calcEMA(closes, fast)
  const emaSlow = calcEMA(closes, slow)
  if (emaFast === null || emaSlow === null) return null
  const macdLine = emaFast - emaSlow
  const signalArr = []
  for (let i = slow - 1; i < closes.length; i++) {
    const eFast = calcEMA(closes.slice(0, i + 1), fast)
    const eSlow = calcEMA(closes.slice(0, i + 1), slow)
    if (eFast !== null && eSlow !== null) signalArr.push(eFast - eSlow)
  }
  const signalLine = calcEMA(signalArr, signal)
  return {
    macdLine: parseFloat(macdLine.toFixed(4)),
    signalLine: signalLine !== null ? parseFloat(signalLine.toFixed(4)) : null,
    histogram: signalLine !== null ? parseFloat((macdLine - signalLine).toFixed(4)) : null,
    bullish: signalLine !== null ? macdLine > signalLine : null,
  }
}

export function calc52WRange(highs, lows) {
  const tradingDays = 252
  const sliceH = highs.slice(-tradingDays)
  const sliceL = lows.slice(-tradingDays)
  return {
    high: Math.max(...sliceH),
    low: Math.min(...sliceL),
  }
}

export function calcVolumeAvg(volumes, period = 20) {
  if (volumes.length < period) return null
  return volumes.slice(-period).reduce((a, b) => a + b, 0) / period
}

export function calcTrend(price, sma50, sma200) {
  if (!sma50 || !sma200) return "Neutral"
  if (price > sma50 && sma50 > sma200) return "Bullish"
  if (price < sma50 && sma50 < sma200) return "Bearish"
  return "Neutral"
}

export function calcEWIndex(stockReturns) {
  if (!stockReturns.length) return 100
  const avg = stockReturns.reduce((a, b) => a + b, 0) / stockReturns.length
  return parseFloat((100 * (1 + avg / 100)).toFixed(2))
}

export function deriveMetrics(candles) {
  if (!candles || candles.length < 30) return null
  const closes  = candles.map(c => c.c)
  const highs   = candles.map(c => c.h)
  const lows    = candles.map(c => c.l)
  const volumes = candles.map(c => c.v)
  const price   = closes[closes.length - 1]
  const prevClose = closes[closes.length - 2]
  const change  = price - prevClose
  const changePct = parseFloat(((change / prevClose) * 100).toFixed(2))
  const sma50   = calcSMA(closes, 50)
  const sma200  = calcSMA(closes, 200)
  const rsi     = calcRSI(closes)
  const macd    = calcMACD(closes)
  const range52 = calc52WRange(highs, lows)
  const volAvg  = calcVolumeAvg(volumes)
  const lastVol = volumes[volumes.length - 1]
  const trend   = calcTrend(price, sma50, sma200)
  const yearAgo = closes[Math.max(0, closes.length - 252)]
  const return12m = parseFloat(((price - yearAgo) / yearAgo * 100).toFixed(2))

  return {
    price,
    change,
    changePct,
    sma50,
    sma200,
    vs50dma: sma50 ? parseFloat(((price - sma50) / sma50 * 100).toFixed(2)) : null,
    vs200dma: sma200 ? parseFloat(((price - sma200) / sma200 * 100).toFixed(2)) : null,
    rsi,
    macd,
    range52,
    distFrom52wh: range52 ? parseFloat(((price - range52.high) / range52.high * 100).toFixed(2)) : null,
    volAvg,
    lastVol,
    volVsAvg: volAvg ? (lastVol > volAvg ? "Above" : "Below") : null,
    trend,
    return12m,
    sparkline: closes.slice(-30),
  }
}
