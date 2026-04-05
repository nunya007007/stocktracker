import { useState, useEffect, useCallback } from 'react'

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
        setLastUpdate(new Date(data.cachedAt))
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

  // Fetch live quotes from server-side API
  const fetchQuotes = useCallback(async () => {
    try {
      // Build comma-separated ticker list
      const tickerList = stocks.map(s => s.ticker).join(',')
      
      console.log('💰 Fetching quotes for', stocks.length, 'stocks via /api/quotes')
      
      const res = await fetch(`/api/quotes?tickers=${encodeURIComponent(tickerList)}`)
      
      if (res.ok) {
        const data = await res.json()
        console.log('💰 Quotes received:', data.fetched, '/', data.requested, 'stocks')
        
        if (data.errors && data.errors.length > 0) {
          console.warn('💰 Some quote errors:', data.errors)
        }
        
        setQuotes(data.quotes || {})
        return data.quotes || {}
      } else {
        const error = await res.text()
        console.error('💰 Quotes API error:', res.status, error)
      }
    } catch (e) {
      console.error('Failed to fetch quotes:', e)
    }
    return {}
  }, [stocks])

  // Load indicators and quotes in parallel
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setProgress(25)
      
      // Fetch both indicators and quotes in parallel
      const [indData, quoteData] = await Promise.all([
        fetchIndicators(),
        fetchQuotes()
      ])
      
      setProgress(100)
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
        ...quote, // Quote price overrides indicator price if both exist
      }
    }
  })

  const refresh = async () => {
    setLoading(true)
    setProgress(0)
    await fetchQuotes()
    setProgress(100)
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