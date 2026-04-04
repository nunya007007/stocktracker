// Mock data generator - produces realistic-looking stock data
// Remove this file and use real Finnhub API when ready to upgrade

export function getMockStockData(symbol) {
  // Generate realistic but fake metrics
  const basePrice = 50 + Math.random() * 300
  const dayChange = (Math.random() - 0.5) * 10
  const dayPct = (dayChange / basePrice) * 100
  const rsi = 30 + Math.random() * 40
  const macdValue = (Math.random() - 0.5) * 2
  const return12m = (Math.random() - 0.3) * 100
  
  const sma50 = basePrice * (0.95 + Math.random() * 0.1)
  const sma200 = basePrice * (0.9 + Math.random() * 0.15)
  
  const vs50 = ((basePrice - sma50) / sma50) * 100
  const vs200 = ((basePrice - sma200) / sma200) * 100
  
  const high52w = basePrice * (1 + Math.random() * 0.3)
  const distFrom52w = ((high52w - basePrice) / high52w) * 100
  
  const volRatio = 0.5 + Math.random() * 2

  let trend = 'Neutral'
  if (rsi > 60 && macdValue > 0 && basePrice > sma50) trend = 'Bullish'
  else if (rsi < 40 && macdValue < 0 && basePrice < sma50) trend = 'Bearish'

  return {
    price: parseFloat(basePrice.toFixed(2)),
    changePct: parseFloat(dayPct.toFixed(2)),
    rsi: parseFloat(rsi.toFixed(2)),
    macd: { bullish: macdValue > 0 },
    sma50: parseFloat(sma50.toFixed(2)),
    sma200: parseFloat(sma200.toFixed(2)),
    sma200Slope: basePrice > sma200 ? '▲' : '▼',
    high52w: parseFloat(high52w.toFixed(2)),
    low52w: parseFloat((basePrice * 0.7).toFixed(2)),
    distFrom52wh: parseFloat(distFrom52w.toFixed(2)),
    volRatio: parseFloat(volRatio.toFixed(2)),
    volVsAvg: volRatio > 1 ? 'Above' : 'Below',
    vs50dma: parseFloat(vs50.toFixed(2)),
    vs200dma: parseFloat(vs200.toFixed(2)),
    return12m: parseFloat(return12m.toFixed(2)),
    trend: trend,
    support: parseFloat((basePrice * 0.95).toFixed(2)),
    resistance: parseFloat((basePrice * 1.05).toFixed(2)),
  }
}
