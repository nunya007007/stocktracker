import { CONFIG } from '../data/config.js'

const BASE = 'https://finnhub.io/api/v1'
const KEY  = CONFIG.finnhubApiKey

// Simple rate-limited queue — max 1 call per 100ms (10/sec, well under 60/min)
const queue = []
let running = false

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function runQueue() {
  if (running) return
  running = true
  while (queue.length > 0) {
    const { fn, resolve, reject } = queue.shift()
    try { resolve(await fn()) } catch (e) { reject(e) }
    if (queue.length > 0) await sleep(120)
  }
  running = false
}

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject })
    runQueue()
  })
}

async function get(path) {
  console.log('🔍 API Request:', { BASE, KEY: KEY ? '✓ set' : '✗ missing', path })
  const res = await fetch(`${BASE}${path}&token=${KEY}`)
  console.log('📊 API Response:', res.status, res.statusText)
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${path}`)
  return res.json()
}

export function fetchCandles(symbol, resolution = 'D', days = 400) {
  const to   = Math.floor(Date.now() / 1000)
  const from = to - days * 86400
  const sym  = encodeURIComponent(symbol)
  return enqueue(() => get(`/stock/candle?symbol=${sym}&resolution=${resolution}&from=${from}&to=${to}`))
}

export function fetchQuote(symbol) {
  const sym = encodeURIComponent(symbol)
  return enqueue(() => get(`/quote?symbol=${sym}`))
}

export function fetchProfile(symbol) {
  const sym = encodeURIComponent(symbol)
  return enqueue(() => get(`/stock/profile2?symbol=${sym}`))
}

// Fetch full candle set and return structured array
export async function getStockCandles(symbol) {
  try {
    const data = await fetchCandles(symbol)
    if (!data || data.s !== 'ok' || !data.c?.length) return null
    return data.c.map((c, i) => ({
      t: data.t[i], o: data.o[i], h: data.h[i], l: data.l[i], c, v: data.v[i],
    }))
  } catch {
    return null
  }
}

export async function getQuote(symbol) {
  try {
    const data = await fetchQuote(symbol)
    return data
  } catch {
    return null
  }
}
