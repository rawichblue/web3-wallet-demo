import Image from 'next/image'
import type { Holding } from '@/types/portfolio'
import { formatPrice, formatTokenAmount, getChangeBg } from '@/lib/utils/format'

interface BalanceCardProps {
  holdings: Holding[]
  loading?: boolean
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-gray-800" />
      <div className="flex-1">
        <div className="h-4 w-16 rounded bg-gray-800" />
        <div className="mt-1 h-3 w-24 rounded bg-gray-800" />
      </div>
      <div className="text-right">
        <div className="h-4 w-20 rounded bg-gray-800" />
        <div className="mt-1 h-3 w-14 rounded bg-gray-800" />
      </div>
    </div>
  )
}

export default function BalanceCard({ holdings, loading }: BalanceCardProps) {
  const total = holdings.reduce((sum, h) => sum + h.valueUsd, 0)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="border-b border-gray-800 px-5 py-4">
        <p className="text-sm text-gray-400">Total Holdings Value</p>
        {loading ? (
          <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-800" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-white">{formatPrice(total)}</p>
        )}
      </div>

      <div className="divide-y divide-gray-800">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : holdings.map((h) => (
              <div key={h.tokenAddress} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors">
                {h.logoUrl ? (
                  <Image src={h.logoUrl} alt={h.symbol} width={36} height={36} className="rounded-full" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                    {h.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{h.symbol}</p>
                  <p className="text-xs text-gray-500">{formatTokenAmount(h.balanceFormatted)} {h.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatPrice(h.valueUsd)}</p>
                  <span className={`text-xs font-medium rounded px-1.5 py-0.5 ${getChangeBg(h.change24h)}`}>
                    {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
