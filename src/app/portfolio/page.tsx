'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { portfolioSelector, fetchPortfolioService, fetchTransactionsService } from '@/store-redux/slices/portfolio'
import { formatPrice, formatPercent, getChangeColor } from '@/lib/utils/format'
import ConnectPrompt from '@/components/portfolio/ConnectPrompt'
import BalanceCard from '@/components/portfolio/BalanceCard'
import TxHistory from '@/components/portfolio/TxHistory'

interface SummaryCard {
  label: string
  value: string
  change?: number
}

export default function PortfolioPage() {
  const dispatch = useAppDispatch()
  const { holdings, transactions, summary, loading, loadingTx } = useSelector(portfolioSelector)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      dispatch(fetchPortfolioService(address))
      dispatch(fetchTransactionsService(address))
    }
  }, [dispatch, isConnected, address])

  if (!isConnected) {
    return <ConnectPrompt />
  }

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
              { label: 'Total Value', value: formatPrice(summary.totalValueUsd) },
              { label: '24h Change', value: formatPrice(Math.abs(summary.change24hUsd)), change: summary.change24hPercent },
              { label: 'Holdings', value: `${summary.holdingsCount} tokens` },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BalanceCard holdings={holdings} loading={loading} />
        <TxHistory transactions={transactions} loading={loadingTx} />
      </div>
    </div>
  )
}
