import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function Sparkline({ data = [], positive = true, height = 48 }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!ref.current || data.length < 2) return
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height,
      layout: { background: { color: 'transparent' }, textColor: 'transparent' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { visible: false },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    })

    const color = positive ? '#22c55e' : '#ef4444'
    const series = chart.addAreaSeries({
      lineColor: color,
      topColor: positive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
      bottomColor: 'transparent',
      lineWidth: 1.5,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    const now = Math.floor(Date.now() / 1000)
    const daySeconds = 86400
    series.setData(data.map((v, i) => ({
      time: now - (data.length - 1 - i) * daySeconds,
      value: v,
    })))

    chart.timeScale().fitContent()
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth })
    })
    ro.observe(ref.current)
    return () => { ro.disconnect(); chart.remove(); chartRef.current = null }
  }, [data, positive, height])

  return <div ref={ref} style={{ width: '100%', height }} />
}
