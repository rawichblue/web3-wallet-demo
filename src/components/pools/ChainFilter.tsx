'use client'

import type { ChainFilter } from '@/types/pool'

const FILTERS: { label: string; value: ChainFilter; color: string }[] = [
  { label: 'All Chains', value: 'all',       color: '#6366f1' },
  { label: 'Ethereum',   value: 'ethereum',  color: '#627EEA' },
  { label: 'BNB Chain',  value: 'bsc',       color: '#F3BA2F' },
  { label: 'Polygon',    value: 'polygon',   color: '#8247E5' },
  { label: 'Arbitrum',   value: 'arbitrum',  color: '#28A0F0' },
  { label: 'Base',       value: 'base',      color: '#0052FF' },
  { label: 'Avalanche',  value: 'avalanche', color: '#E84142' },
  { label: 'zkSync Era', value: 'zksync',    color: '#8C8DFC' },
]

interface ChainFilterProps {
  active: ChainFilter
  onChange: (chain: ChainFilter) => void
}

export default function ChainFilterBar({ active, onChange }: ChainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            active === f.value
              ? 'border-indigo-500 bg-indigo-600/20 text-white'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
          }`}
        >
          {f.value !== 'all' && (
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
          )}
          {f.label}
        </button>
      ))}
    </div>
  )
}
