// API endpoint - fetches live quotes server-side to keep API key secure

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export default async function handler(req, res) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Get tickers from query string (comma-separated)
    const { tickers } = req.query
    if (!tickers) {
      return res.status(400).json({ error: 'Missing tickers parameter' })
    }

    if (!FINNHUB_API_KEY) {
      return res.status(500).json({ error: 'Finnhub API key not configured' })
    }

    const tickerList = tickers.split(',')
    const quotes = {}
    const errors = []

    // Fetch quotes with rate limiting (100ms delays)
    for (const ticker of tickerList) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`
        )

        if (!response.ok) {
          errors.push(`${ticker}: HTTP ${response.status}`)
          continue
        }

        const data = await response.json()
        
        // Check for valid data
        if (data.c && data.c > 0) {
          quotes[ticker] = {
            price: parseFloat(data.c.toFixed(2)),
            changePct: parseFloat(((data.dp || 0)).toFixed(2)),
            change: parseFloat(((data.d || 0)).toFixed(2)),
            high: data.h || 0,
            low: data.l || 0,
            open: data.o || 0,
            previousClose: data.pc || 0
          }
        } else {
          errors.push(`${ticker}: No valid data`)
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        errors.push(`${ticker}: ${error.message}`)
      }
    }

    res.status(200).json({
      quotes,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      fetched: Object.keys(quotes).length,
      requested: tickerList.length
    })

  } catch (error) {
    console.error('Quote API error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const config = {
  maxDuration: 60, // 1 minute max for quote fetching
}