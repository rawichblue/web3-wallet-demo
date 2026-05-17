'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Token } from '@/types/market'
import { formatPrice, formatLargeNumber, getChangeColor } from '@/lib/utils/format'

interface TokenListProps {
  tokens: Token[]
  loading?: boolean
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 w-6 rounded bg-gray-800" />
      <div className="h-8 w-8 rounded-full bg-gray-800" />
      <div className="flex-1">
        <div className="h-4 w-20 rounded bg-gray-800" />
        <div className="mt-1 h-3 w-12 rounded bg-gray-800" />
      </div>
      <div className="h-4 w-24 rounded bg-gray-800" />
      <div className="hidden h-4 w-20 rounded bg-gray-800 md:block" />
      <div className="hidden h-4 w-28 rounded bg-gray-800 lg:block" />
    </div>
  )
}

export default function TokenList({ tokens, loading }: TokenListProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 px-4 py-3">
        <span className="w-6 text-xs text-gray-500">#</span>
        <span className="flex-1 text-xs text-gray-500">Token</span>
        <span className="w-28 text-right text-xs text-gray-500">Price</span>
        <span className="hidden w-20 text-right text-xs text-gray-500 md:block">24h %</span>
        <span className="hidden w-32 text-right text-xs text-gray-500 lg:block">Market Cap</span>
        <span className="hidden w-28 text-right text-xs text-gray-500 xl:block">Volume 24h</span>
      </div>

      {loading
        ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
        : tokens.map((token) => (
            <Link
              key={token.id}
              href={`/token/${token.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0"
            >
              <span className="w-6 text-sm text-gray-500">{token.market_cap_rank}</span>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Image
                  src={token.image}
                  alt={token.name}
                  width={32}
                  height={32}
                  className="rounded-full flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{token.name}</p>
                  <p className="text-xs text-gray-500 uppercase">{token.symbol}</p>
                </div>
              </div>

              <span className="w-28 text-right text-sm font-medium text-white">
                {formatPrice(token.current_price)}
              </span>

              <span className={`hidden w-20 text-right text-sm md:block ${getChangeColor(token.price_change_percentage_24h)}`}>
                {token.price_change_percentage_24h >= 0 ? '+' : ''}
                {token.price_change_percentage_24h.toFixed(2)}%
              </span>

              <span className="hidden w-32 text-right text-sm text-gray-300 lg:block">
                {formatLargeNumber(token.market_cap)}
              </span>

              <span className="hidden w-28 text-right text-sm text-gray-300 xl:block">
                {formatLargeNumber(token.total_volume)}
              </span>
            </Link>
          ))}
    </div>
  )
}
