'use client'

import { useEffect, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { portfolioSelector, fetchPortfolioService, fetchTransactionsService } from '@/store-redux/slices/portfolio'
import { formatPrice, formatPercent, getChangeColor } from '@/lib/utils/format'
import ConnectPrompt from '@/components/portfolio/ConnectPrompt'
import BalanceCard from '@/components/portfolio/BalanceCard'
import TxHistory from '@/components/portfolio/TxHistory'
import ApiError from '@/components/ui/ApiError'

interface SummaryCard {
  label: string
  value: string
  change?: number
}

export default function PortfolioPage() {
  const dispatch = useAppDispatch()
  const { holdings, transactions, summary, loading, loadingTx, error, errorTx } = useSelector(portfolioSelector)
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  // false = show only tokens with actual balance (default)
  // true  = show everything including historical / zero-balance dust
  const [showZero, setShowZero] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      dispatch(fetchPortfolioService({ address, chainId }))
      dispatch(fetchTransactionsService({ address, chainId }))
    }
  }, [dispatch, isConnected, address, chainId])

  if (!isConnected) {
    return <ConnectPrompt />
  }

  const visibleHoldings = showZero
    ? holdings
    : holdings.filter((h) => !h.isZeroBalance)

  const dustCount = holdings.filter((h) => h.isZeroBalance).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="mt-1 font-mono text-sm text-gray-500">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        {summary && (
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatPrice(summary.totalValueUsd)}</p>
            <span className={`text-sm font-medium ${getChangeColor(summary.change24hPercent)}`}>
              {formatPercent(summary.change24hPercent)} today
            </span>
          </div>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: 'Total Value',  value: formatPrice(summary.totalValueUsd) },
              { label: '24h Change',   value: formatPrice(Math.abs(summary.change24hUsd)), change: summary.change24hPercent },
              { label: 'Holdings',     value: `${summary.holdingsCount} tokens` },
            ] satisfies SummaryCard[]
          ).map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
              {s.change !== undefined && (
                <span className={`text-xs font-medium ${getChangeColor(s.change)}`}>
                  {formatPercent(s.change)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zero-balance toggle — only show when there's something to toggle */}
      {!loading && dustCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-500">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
            </svg>
            <span className="text-sm text-gray-400">
              {dustCount} zero-balance token{dustCount !== 1 ? 's' : ''} hidden
              <span className="ml-1 text-xs text-gray-600">(past interactions / dust)</span>
            </span>
          </div>

          {/* Toggle switch */}
          <button
            onClick={() => setShowZero((v) => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              showZero ? 'bg-indigo-600' : 'bg-gray-700'
            }`}
            role="switch"
            aria-checked={showZero}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                showZero ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {error
          ? <ApiError message={error} onRetry={() => address && dispatch(fetchPortfolioService({ address, chainId }))} />
          : <BalanceCard holdings={visibleHoldings} loading={loading} showZero={showZero} />
        }
        {errorTx
          ? <ApiError message={errorTx} onRetry={() => address && dispatch(fetchTransactionsService({ address, chainId }))} />
          : <TxHistory transactions={transactions} loading={loadingTx} />
        }
      </div>
    </div>
  )
}
