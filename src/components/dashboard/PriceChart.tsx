'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchPriceHistoryService } from '@/store-redux/slices/market'
import { formatPrice } from '@/lib/utils/format'
import type { PricePoint } from '@/types/market'

const PERIODS = [
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
]

interface PriceChartProps {
  tokenId: string
  tokenName: string
  currentPrice: number
  change24h: number
}

interface AreaChartInnerProps {
  data: PricePoint[]
  isPositive: boolean
}

const AreaChartInner = dynamic(() => import('./AreaChartInner'), { ssr: false })

export default function PriceChart({ tokenId, tokenName, currentPrice, change24h }: PriceChartProps) {
  const dispatch = useAppDispatch()
  const { priceHistory, loadingPriceHistory } = useSelector(marketSelector)
  const [activePeriod, setActivePeriod] = useState<{ label: string; days: number }>(PERIODS[1]!)

  useEffect(() => {
    dispatch(fetchPriceHistoryService({ tokenId, days: activePeriod.days }))
  }, [dispatch, tokenId, activePeriod])

  const isPositive = change24h >= 0

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{tokenName} Price</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatPrice(currentPrice)}</p>
          <span className={`mt-1 inline-block text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change24h.toFixed(2)}% (24h)
          </span>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activePeriod.label === p.label
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-48">
        {loadingPriceHistory ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <AreaChartInner data={priceHistory} isPositive={isPositive} />
        )}
      </div>
    </div>
  )
}
