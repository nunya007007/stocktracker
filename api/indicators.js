// API endpoint - returns cached indicators from cron + their timestamp

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  try {
    const [indicators, timestamp] = await Promise.all([
      kv.get('indicators:latest'),
      kv.get('indicators:lastUpdate'),
    ])

    if (!indicators) {
      return res.status(404).json({ error: 'No cached indicators yet' })
    }

    res.status(200).json({
      data: JSON.parse(indicators),
      lastUpdate: timestamp,
      cachedAt: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
