'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils/format'
import type { PricePoint } from '@/types/market'

interface TooltipPayload {
  active?: boolean
  payload?: { value?: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">
        {formatPrice(payload[0]?.value ?? 0)}
      </p>
    </div>
  )
}

interface AreaChartInnerProps {
  data: PricePoint[]
  isPositive: boolean
}

export default function AreaChartInner({ data, isPositive }: AreaChartInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const color = isPositive ? '#34d399' : '#f87171'

  const chartData = data.map((p) => ({
    price: p.price,
    date: new Date(p.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div ref={containerRef} className="h-full w-full">
      {size && chartData.length > 0 && (
        <AreaChart width={size.width} height={size.height} data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            fill="url(#colorPrice)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      )}
    </div>
  )
}
