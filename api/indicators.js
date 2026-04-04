// API endpoint - returns cached indicators for requested stocks

import { kv } from '@vercel/kv'

// Stock list (same as cron)
const STOCKS = [
  { ticker: "4062.T",  name: "Ibiden" },
  { ticker: "6857.T",  name: "Advantest" },
  { ticker: "AMKR",    name: "Amkor Technology" },
  { ticker: "KLAC",    name: "KLA Corp" },
  { ticker: "AIP",     name: "Arteris" },
  { ticker: "ASML",    name: "ASML" },
  { ticker: "6146.T",  name: "Disco Corp" },
  { ticker: "RMBS",    name: "Rambus" },
  { ticker: "BESI.AS", name: "BE Semiconductor" },
  { ticker: "AVGO",    name: "Broadcom" },
  { ticker: "LSCC",    name: "Lattice Semiconductor" },
  { ticker: "2802.T",  name: "Ajinomoto Co" },
  { ticker: "ARM",     name: "Arm Holdings" },
  { ticker: "CDNS",    name: "Cadence Design Systems" },
  { ticker: "MRVL",    name: "Marvell Technology" },
  { ticker: "HO.PA",   name: "Thales" },
  { ticker: "IFX.DE",  name: "Infineon Technologies" },
  { ticker: "6526.T",  name: "Socionext" },
  { ticker: "SOI.PA",  name: "Soitec" },
  { ticker: "SIE.DE",  name: "Siemens" },
  { ticker: "NXPI",    name: "NXP Semiconductors" },
  { ticker: "SNPS",    name: "Synopsys" },
  { ticker: "QCOM",    name: "Qualcomm" },
]

export default async function handler(req, res) {
  try {
    // Fetch all indicator keys in parallel
    const keys = STOCKS.map(s => `indicators:${s.ticker}`)
    const timestamps = STOCKS.map(s => `indicators:lastUpdate:${s.ticker}`)
    
    const allKeys = [...keys, ...timestamps]
    const kvData = await Promise.all(
      allKeys.map(key => kv.get(key))
    )

    // Reconstruct data structure
    const indicators = {}
    const lastUpdates = {}

    for (let i = 0; i < STOCKS.length; i++) {
      const ticker = STOCKS[i].ticker
      const indicatorData = kvData[i]
      const lastUpdate = kvData[STOCKS.length + i]

      if (indicatorData) {
        indicators[ticker] = typeof indicatorData === 'string' 
          ? JSON.parse(indicatorData) 
          : indicatorData
        lastUpdates[ticker] = lastUpdate
      }
    }

    if (Object.keys(indicators).length === 0) {
      return res.status(404).json({ error: 'No cached indicators yet' })
    }

    res.status(200).json({
      data: indicators,
      lastUpdates,
      cachedAt: new Date().toISOString(),
      cached: Object.keys(indicators).length,
      total: STOCKS.length,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
