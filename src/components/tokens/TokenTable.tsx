'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Token } from '@/types/market'
import { formatPrice, formatLargeNumber, getChangeBg } from '@/lib/utils/format'

interface TokenTableProps {
  tokens: Token[]
  loading?: boolean
}

const SKELETON_WIDTHS: readonly string[] = ['30%', '60%', '50%', '45%', '55%', '65%', '50%']

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

export default function TokenTable({ tokens, loading }: TokenTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {['#', 'Token', 'Price', '24h %', '7d %', 'Market Cap', 'Volume 24h'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <SkeletonRow key={i} />)
            : tokens.map((token) => (
                <tr
                  key={token.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors last:border-0"
                >
                  <td className="px-4 py-4 text-sm text-gray-500">{token.market_cap_rank}</td>
                  <td className="px-4 py-4">
                    <Link href={`/token/${token.id}`} className="flex items-center gap-3 hover:underline">
                      <Image src={token.image} alt={token.name} width={28} height={28} className="rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-white">{token.name}</p>
                        <p className="text-xs uppercase text-gray-500">{token.symbol}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-white">
                    {formatPrice(token.current_price)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium ${getChangeBg(token.price_change_percentage_24h)}`}>
                      {token.price_change_percentage_24h >= 0 ? '+' : ''}
                      {token.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {token.price_change_percentage_7d !== undefined ? (
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ${getChangeBg(token.price_change_percentage_7d)}`}>
                        {token.price_change_percentage_7d >= 0 ? '+' : ''}
                        {token.price_change_percentage_7d.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {formatLargeNumber(token.market_cap)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {formatLargeNumber(token.total_volume)}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {!loading && tokens.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-500">No tokens found</p>
        </div>
      )}
    </div>
  )
}
