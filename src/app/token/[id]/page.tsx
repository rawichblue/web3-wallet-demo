'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import {
  marketSelector,
  fetchTokensService,
  fetchTokenDetailService,
  fetchTokenDexInfoService,
} from '@/store-redux/slices/market'
import { formatPrice, formatLargeNumber, getChangeBg } from '@/lib/utils/format'
import PriceChart from '@/components/dashboard/PriceChart'
import ApiError from '@/components/ui/ApiError'

interface TokenStat {
  label: string
  value: string
}

export default function TokenDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const { tokens, loading, dexInfo, loadingDexInfo, errorDexInfo } = useSelector(marketSelector)

  const tokenId = params.id as string
  const token   = tokens.find((t) => t.id === tokenId)

  // Load token list if empty, then fetch full detail for contractAddress
  useEffect(() => {
    if (tokens.length === 0) dispatch(fetchTokensService())
  }, [dispatch, tokens.length])

  useEffect(() => {
    if (!token) return
    // If we don't have contractAddress yet, fetch full token detail
    if (token.contractAddress === undefined) {
      dispatch(fetchTokenDetailService(tokenId))
    }
  }, [dispatch, token, tokenId])

  // Fetch DEX info once contractAddress is available
  useEffect(() => {
    if (token?.contractAddress) {
      dispatch(fetchTokenDexInfoService(token.contractAddress))
    }
  }, [dispatch, token?.contractAddress])

  if (loading && tokens.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-800" />
        <div className="h-64 rounded-xl bg-gray-900" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-xl text-white">Token not found</p>
        <button onClick={() => router.back()} className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Go back
        </button>
      </div>
    )
  }

  const bestPrice = dexInfo.length > 0
    ? Math.max(...dexInfo.map((d) => parseFloat(d.priceUsd)))
    : 0

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/tokens" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
        </svg>
        Back to Tokens
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Image src={token.image} alt={token.name} width={48} height={48} className="rounded-full" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{token.name}</h1>
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-sm font-medium uppercase text-gray-400">
              {token.symbol}
            </span>
            <span className="rounded-md bg-gray-800 px-2 py-0.5 text-sm text-gray-500">
              Rank #{token.market_cap_rank}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xl font-semibold text-white">{formatPrice(token.current_price)}</span>
            <span className={`rounded-md px-2 py-0.5 text-sm font-medium ${getChangeBg(token.price_change_percentage_24h)}`}>
              {token.price_change_percentage_24h >= 0 ? '+' : ''}
              {token.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <PriceChart
        tokenId={token.id}
        tokenName={token.name}
        currentPrice={token.current_price}
        change24h={token.price_change_percentage_24h}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            { label: 'Market Cap',         value: formatLargeNumber(token.market_cap) },
            { label: 'Volume 24h',         value: formatLargeNumber(token.total_volume) },
            { label: 'All-Time High',      value: formatPrice(token.ath) },
            { label: 'Circulating Supply', value: `${(token.circulating_supply / 1_000_000).toFixed(1)}M ${token.symbol.toUpperCase()}` },
          ] satisfies TokenStat[]
        ).map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="mt-1 text-base font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* DEX Listings */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Available on DEXs</h2>
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="grid grid-cols-4 border-b border-gray-800 px-5 py-3">
            {['DEX', 'Price', 'Volume 24h', 'Liquidity'].map((h) => (
              <span key={h} className="text-xs text-gray-500">{h}</span>
            ))}
          </div>

          {loadingDexInfo && (
            <div className="animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 border-b border-gray-800/50 px-5 py-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-4 rounded bg-gray-800" />
                  ))}
                </div>
              ))}
            </div>
          )}

          {!loadingDexInfo && errorDexInfo && (
            <div className="p-4">
              <ApiError
                message={errorDexInfo}
                compact
                onRetry={() => token.contractAddress && dispatch(fetchTokenDexInfoService(token.contractAddress))}
              />
            </div>
          )}

          {!loadingDexInfo && !errorDexInfo && dexInfo.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">
                {token.contractAddress ? 'No DEX listings found' : 'No contract address available for this token'}
              </p>
            </div>
          )}

          {!loadingDexInfo && !errorDexInfo && dexInfo.map((dex) => {
            const isBest = parseFloat(dex.priceUsd) === bestPrice
            return (
              <div key={dex.pairAddress} className="grid grid-cols-4 items-center border-b border-gray-800/50 px-5 py-4 hover:bg-gray-800/30 transition-colors last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white">{dex.dexName}</span>
                  {isBest && (
                    <span className="rounded bg-green-400/10 px-1.5 py-0.5 text-xs text-green-400">Best</span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">{formatPrice(parseFloat(dex.priceUsd))}</span>
                <span className="text-sm text-gray-300">{formatLargeNumber(dex.volume24h)}</span>
                <span className="text-sm text-gray-300">{formatLargeNumber(dex.liquidity)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
