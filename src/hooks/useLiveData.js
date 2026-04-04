import { useState, useEffect, useCallback, useRef } from 'react'

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const QUOTE_CACHE = {} // Browser-side, no TTL (always fresh on page load)
const QUOTE_QUEUE = []
let QUEUE_PROCESSING = false

async function processQuoteQueue() {
  if (QUEUE_PROCESSING || QUOTE_QUEUE.length === 0) return
  QUEUE_PROCESSING = true

  while (QUOTE_QUEUE.length > 0) {
    const { ticker, resolve } = QUOTE_QUEUE.shift()
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`
      )
      if (res.ok) {
        const quote = await res.json()
        resolve({
          price: quote.c || 0,
          changePct: quote.dp || 0,
          high: quote.h || 0,
          low: quote.l || 0,
          volume: quote.v || 0,
        })
      } else {
        resolve(null)
      }
    } catch (e) {
      console.error(`Quote fetch failed for ${ticker}:`, e)
      resolve(null)
    }
    // 100ms delay between requests to stay under rate limit
    await new Promise(r => setTimeout(r, 100))
  }

  QUEUE_PROCESSING = false
}

function fetchQuoteQueued(ticker) {
  return new Promise(resolve => {
    QUOTE_QUEUE.push({ ticker, resolve })
    processQuoteQueue()
  })
}

export function useLiveData(stocks) {
  const [indicators, setIndicators] = useState({})
  const [quotes, setQuotes] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  // Fetch cached indicators from cron job
  const fetchIndicators = useCallback(async () => {
    try {
      const res = await fetch('/api/indicators')
      if (res.ok) {
        const data = await res.json()
        setIndicators(data.data)
        setLastUpdate(new Date(data.lastUpdate))
        return data.data
      }
    } catch (e) {
      console.error('Failed to fetch indicators:', e)
    }
    return {}
  }, [])

  // Fetch live quotes for all stocks with deduplication
  const fetchQuotes = useCallback(async (indicatorData) => {
    const results = {}
    const fetchedInThisSession = new Set()  // Track what we've fetched
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i]
      
      // Skip if already fetched in this refresh session
      if (fetchedInThisSession.has(stock.ticker)) {
        console.log(`⏭️  Already fetched: ${stock.ticker}`)
        continue
      }
      
      const quote = await fetchQuoteQueued(stock.ticker)
      if (quote) {
        results[stock.ticker] = quote
      }
      
      // Mark as fetched
      fetchedInThisSession.add(stock.ticker)
      
      setProgress(Math.round(((i + 1) / stocks.length) * 100))
      setQuotes(prev => ({ ...prev, [stock.ticker]: quote }))
    }
    return results
  }, [stocks])

  // Load indicators on mount, then fetch quotes
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setProgress(0)
      const indData = await fetchIndicators()
      await fetchQuotes(indData)
      setLoading(false)
    })()
  }, [fetchIndicators, fetchQuotes])

  // Merge indicator data with live quotes
  // Show quotes even without indicators (show what we have)
  const mergedData = {}
  stocks.forEach(stock => {
    const ind = indicators[stock.ticker]
    const quote = quotes[stock.ticker]
    if (ind || quote) {
      mergedData[stock.ticker] = {
        ...ind,
        ...quote, // Quote price overrides indicator price
      }
    }
  })

  const refresh = async () => {
    setLoading(true)
    setProgress(0)
    await fetchQuotes(indicators)
    setLoading(false)
  }

  return {
    data: mergedData,
    loading,
    progress,
    lastUpdate,
    refresh,
  }
}
