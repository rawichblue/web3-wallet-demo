'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchTokensService, fetchMarketStatsService } from '@/store-redux/slices/market'
import { formatLargeNumber } from '@/lib/utils/format'
import StatCard from '@/components/dashboard/StatCard'
import TokenList from '@/components/dashboard/TokenList'
import PriceChart from '@/components/dashboard/PriceChart'
import GasTracker from '@/components/dashboard/GasTracker'
import ApiError from '@/components/ui/ApiError'

// Top tokens to show in the chart picker (by CoinGecko id)
const CHART_PICKS = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple', 'usd-coin', 'cardano']

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { tokens, marketStats, loading, error, errorStats } = useSelector(marketSelector)
  const [selectedTokenId, setSelectedTokenId] = useState<string>('ethereum')

  useEffect(() => {
    dispatch(fetchTokensService())
    dispatch(fetchMarketStatsService())
  }, [dispatch])

  // Tokens available in the picker (intersection of CHART_PICKS and loaded tokens)
  const pickTokens = CHART_PICKS
    .map(id => tokens.find(t => t.id === id))
    .filter(Boolean) as typeof tokens

  const selectedToken = tokens.find(t => t.id === selectedTokenId) ?? tokens[1] ?? null
  const ethToken = tokens.find(t => t.id === 'ethereum') ?? tokens[1] ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Overview</h1>
        <p className="mt-1 text-sm text-gray-400">Real-time DeFi analytics across multiple chains</p>
      </div>

      {errorStats && (
        <ApiError message={errorStats} compact onRetry={() => dispatch(fetchMarketStatsService())} />
      )}

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
          value={ethToken ? `$${ethToken.current_price.toLocaleString()}` : '—'}
          change={ethToken?.price_change_percentage_24h}
          loading={loading && tokens.length === 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Token picker */}
          {pickTokens.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {pickTokens.map(token => (
                <button
                  key={token.id}
                  onClick={() => setSelectedTokenId(token.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    selectedTokenId === token.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          )}

          {selectedToken ? (
            <PriceChart
              tokenId={selectedToken.id}
              tokenName={selectedToken.name}
              currentPrice={selectedToken.current_price}
              change24h={selectedToken.price_change_percentage_24h}
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
        {error
          ? <ApiError message={error} onRetry={() => dispatch(fetchTokensService())} />
          : <TokenList tokens={tokens.slice(0, 10)} loading={loading} />
        }
      </div>
    </div>
  )
}
