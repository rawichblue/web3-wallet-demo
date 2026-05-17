'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchTokensService, fetchMarketStatsService, fetchGasPriceService } from '@/store-redux/slices/market'
import { formatLargeNumber } from '@/lib/utils/format'
import StatCard from '@/components/dashboard/StatCard'
import TokenList from '@/components/dashboard/TokenList'
import PriceChart from '@/components/dashboard/PriceChart'
import GasTracker from '@/components/dashboard/GasTracker'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { tokens, marketStats, loading } = useSelector(marketSelector)

  useEffect(() => {
    dispatch(fetchTokensService())
    dispatch(fetchMarketStatsService())
    dispatch(fetchGasPriceService())
  }, [dispatch])
  const topToken = tokens[1] ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Overview</h1>
        <p className="mt-1 text-sm text-gray-400">Real-time DeFi analytics across multiple chains</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Market Cap"
          value={marketStats ? formatLargeNumber(marketStats.total_market_cap) : '—'}
          change={marketStats?.market_cap_change_percentage_24h}
          loading={loading && !marketStats}
        />
        <StatCard
          label="24h Volume"
          value={marketStats ? formatLargeNumber(marketStats.total_volume) : '—'}
          loading={loading && !marketStats}
        />
        <StatCard
          label="BTC Dominance"
          value={marketStats ? `${marketStats.bitcoin_dominance.toFixed(1)}%` : '—'}
          loading={loading && !marketStats}
        />
        <StatCard
          label="Ethereum"
          value={tokens[1] ? `$${tokens[1].current_price.toLocaleString()}` : '—'}
          change={tokens[1]?.price_change_percentage_24h}
          loading={loading && tokens.length === 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {topToken ? (
            <PriceChart
              tokenId={topToken.id}
              tokenName={topToken.name}
              currentPrice={topToken.current_price}
              change24h={topToken.price_change_percentage_24h}
            />
          ) : (
            <div className="h-64 animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
          )}
        </div>
        <div>
          <GasTracker />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Top Tokens</h2>
          <a href="/tokens" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View all →
          </a>
        </div>
        <TokenList tokens={tokens} loading={loading} />
      </div>
    </div>
  )
}
