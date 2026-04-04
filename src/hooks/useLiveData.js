import { useState, useEffect, useCallback, useRef } from 'react'

const TWELVEDATA_API_KEY = import.meta.env.VITE_TWELVEDATA_API_KEY
console.log('🔑 TwelveData API Key:', TWELVEDATA_API_KEY ? 'present' : 'MISSING')
const QUOTE_CACHE = {} // Browser-side, no TTL (always fresh on page load)
const QUOTE_QUEUE = []
let QUEUE_PROCESSING = false

async function processQuoteQueue() {
  if (QUEUE_PROCESSING || QUOTE_QUEUE.length === 0) return
  QUEUE_PROCESSING = true

  while (QUOTE_QUEUE.length > 0) {
    const { ticker, resolve } = QUOTE_QUEUE.shift()
    try {
      if (!TWELVEDATA_API_KEY) {
        console.error(`❌ No API key for ${ticker}`)
        resolve(null)
        return
      }
      
      const url = `https://api.twelvedata.com/quote?symbol=${ticker}&apikey=${TWELVEDATA_API_KEY}`
      console.log(`💰 Fetching quote for ${ticker}`)
      
      const res = await fetch(url)
      if (res.ok) {
        const quote = await res.json()
        console.log(`💰 Quote response for ${ticker}:`, quote.status || 'no status')
        
        if (quote.status === 'ok') {
          resolve({
            price: quote.close || 0,
            changePct: quote.percent_change || 0,
            high: quote.high || 0,
            low: quote.low || 0,
            volume: quote.volume || 0,
          })
        } else {
          console.warn(`❌ TwelveData error for ${ticker}:`, quote.status, quote)
          resolve(null)
        }
      } else {
        console.error(`❌ HTTP error for ${ticker}:`, res.status)
        resolve(null)
      }
    } catch (e) {
      console.error(`❌ Quote fetch failed for ${ticker}:`, e)
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
      console.log('📊 Fetching indicators from /api/indicators')
      const res = await fetch('/api/indicators')
      console.log('📊 Indicators response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('📊 Indicators data received:', Object.keys(data.data || {}).length, 'stocks')
        setIndicators(data.data)
        setLastUpdate(new Date(data.lastUpdate))
        return data.data
      } else {
        const error = await res.text()
        console.error('📊 Indicators API error:', res.status, error)
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
