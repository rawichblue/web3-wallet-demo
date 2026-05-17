'use client'

import { useSelector } from 'react-redux'
import { marketSelector } from '@/store-redux/slices/market'

export default function GasTracker() {
  const { gasPrice } = useSelector(marketSelector)

  if (!gasPrice) return null

  const levels = [
    { label: 'Slow', value: gasPrice.slow, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Standard', value: gasPrice.standard, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Fast', value: gasPrice.fast, color: 'text-red-400', bg: 'bg-red-400/10' },
  ]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">Gas Tracker (Ethereum)</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {levels.map((level) => (
          <div key={level.label} className={`rounded-lg ${level.bg} p-3 text-center`}>
            <p className="text-xs text-gray-500">{level.label}</p>
            <p className={`mt-1 text-lg font-bold ${level.color}`}>{level.value}</p>
            <p className="text-xs text-gray-600">gwei</p>
          </div>
        ))}
      </div>
    </div>
  )
}
