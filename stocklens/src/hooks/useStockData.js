import { useState, useEffect, useCallback, useRef } from 'react'
import { getStockCandles } from '../utils/finnhub.js'
import { deriveMetrics } from '../utils/indicators.js'

const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useStockData(stocks) {
  const [data, setData]     = useState({})
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef(false)

  const fetchAll = useCallback(async () => {
    if (!stocks?.length) { setLoading(false); return }
    abortRef.current = false
    setLoading(true)
    setProgress(0)

    const results = {}
    for (let i = 0; i < stocks.length; i++) {
      if (abortRef.current) break
      const stock = stocks[i]
      const cacheKey = stock.ticker
      const cached = CACHE[cacheKey]

      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        results[stock.ticker] = cached.metrics
      } else {
        const candles = await getStockCandles(stock.ticker)
        const metrics = candles ? deriveMetrics(candles) : null
        if (metrics) {
          CACHE[cacheKey] = { metrics, ts: Date.now() }
          results[stock.ticker] = metrics
        } else {
          results[stock.ticker] = null
        }
      }
      setProgress(Math.round(((i + 1) / stocks.length) * 100))
      setData(prev => ({ ...prev, [stock.ticker]: results[stock.ticker] }))
    }
    setLoading(false)
  }, [stocks?.map(s => s.ticker).join(',')])

  useEffect(() => {
    fetchAll()
    return () => { abortRef.current = true }
  }, [fetchAll])

  const refresh = () => {
    stocks?.forEach(s => delete CACHE[s.ticker])
    fetchAll()
  }

  return { data, loading, progress, refresh }
}
