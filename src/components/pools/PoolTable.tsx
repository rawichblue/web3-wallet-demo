'use client'

import React from 'react'
import type { Pool, SortField } from '@/types/pool'
import { formatLargeNumber, getChangeBg } from '@/lib/utils/format'

const DEX_COLORS: Record<string, string> = {
  uniswap: '#FF007A',
  pancakeswap: '#1FC7D4',
  sushiswap: '#0E0F23',
  curve: '#FF0000',
  balancer: '#1E1E1E',
}

interface PoolTableProps {
  pools: Pool[]
  loading?: boolean
  sortField: SortField
  sortOrder: 'asc' | 'desc'
  onSort: (field: SortField) => void
}

function SortIcon({ active, order }: { active: boolean; order: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`ml-1 inline h-3.5 w-3.5 ${active ? 'text-indigo-400' : 'text-gray-600'}`}>
      {active && order === 'desc' ? (
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      ) : (
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
      )}
    </svg>
  )
}

const SKELETON_WIDTHS: readonly string[] = ['70%', '55%', '65%', '50%', '60%', '55%']

function SkeletonRow(): React.ReactElement {
  return (
    <tr className="animate-pulse border-b border-gray-800">
      {SKELETON_WIDTHS.map((width, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-gray-800" style={{ width }} />
        </td>
      ))}
    </tr>
  )
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  bsc: '#F3BA2F',
  polygon: '#8247E5',
  arbitrum: '#28A0F0',
}

export default function PoolTable({ pools, loading, sortField, sortOrder, onSort }: PoolTableProps) {

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pool</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DEX</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Chain</th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-gray-500 hover:text-white"
              onClick={() => onSort('liquidity')}
            >
              Liquidity <SortIcon active={sortField === 'liquidity'} order={sortOrder} />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-gray-500 hover:text-white"
              onClick={() => onSort('volume')}
            >
              Volume 24h <SortIcon active={sortField === 'volume'} order={sortOrder} />
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-right text-xs font-medium text-gray-500 hover:text-white"
              onClick={() => onSort('priceChange')}
            >
              24h % <SortIcon active={sortField === 'priceChange'} order={sortOrder} />
            </th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : pools.map((pool) => (
                <tr key={`${pool.chainId}-${pool.pairAddress}`} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors last:border-0">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-gray-600">
                        {pool.pairAddress.slice(0, 8)}...{pool.pairAddress.slice(-6)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="rounded-md px-2 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: `${DEX_COLORS[pool.dexId] ?? '#374151'}33`, border: `1px solid ${DEX_COLORS[pool.dexId] ?? '#374151'}66` }}
                    >
                      {pool.dexName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHAIN_COLORS[pool.chainId] ?? '#6b7280' }} />
                      <span className="text-sm text-gray-300">{pool.chainName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-300">
                    {formatLargeNumber(pool.liquidity)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-gray-300">
                    {formatLargeNumber(pool.volume.h24)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${getChangeBg(pool.priceChange.h24)}`}>
                      {pool.priceChange.h24 >= 0 ? '+' : ''}{pool.priceChange.h24.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {!loading && pools.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-500">No pools found</p>
        </div>
      )}
    </div>
  )
}
