'use client'

import { useEffect } from 'react'
import { useChainId } from 'wagmi'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchGasPriceService } from '@/store-redux/slices/market'
import ApiError from '@/components/ui/ApiError'

const CHAIN_NAMES: Record<number, string> = {
  1:     'Ethereum',
  56:    'BNB Chain',
  137:   'Polygon',
  42161: 'Arbitrum',
  8453:  'Base',
  43114: 'Avalanche',
  324:   'zkSync Era',
}

const LEVELS = [
  {
    key:    'slow'     as const,
    label:  'Slow',
    time:   '~5 min',
    color:  'text-yellow-400',
    border: 'border-yellow-500/20',
    bg:     'bg-yellow-500/5',
    bar:    'bg-yellow-400',
    pct:    33,
  },
  {
    key:    'standard' as const,
    label:  'Standard',
    time:   '~1 min',
    color:  'text-emerald-400',
    border: 'border-emerald-500/20',
    bg:     'bg-emerald-500/5',
    bar:    'bg-emerald-400',
    pct:    66,
  },
  {
    key:    'fast'     as const,
    label:  'Fast',
    time:   '<30 sec',
    color:  'text-rose-400',
    border: 'border-rose-500/20',
    bg:     'bg-rose-500/5',
    bar:    'bg-rose-400',
    pct:    100,
  },
]

export default function GasTracker() {
  const dispatch   = useAppDispatch()
  const chainId    = useChainId()
  const { gasPrice, errorGas } = useSelector(marketSelector)

  useEffect(() => {
    dispatch(fetchGasPriceService(chainId))
  }, [dispatch, chainId])

  const chainName = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-gray-900 p-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="h-4 w-4 text-orange-400">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Gas Tracker</p>
            <p className="text-xs text-gray-500">{chainName} Network</p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => dispatch(fetchGasPriceService(chainId))}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
          title="Refresh gas prices"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="my-4 h-px bg-gray-800" />

      {/* ── Content ── */}
      {errorGas ? (
        <ApiError message={errorGas} compact onRetry={() => dispatch(fetchGasPriceService(chainId))} />
      ) : !gasPrice ? (
        <div className="flex flex-1 flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          {LEVELS.map((level) => {
            const value = gasPrice[level.key]
            return (
              <div
                key={level.key}
                className={`flex items-center gap-4 rounded-xl border ${level.border} ${level.bg} px-4 py-3`}
              >
                {/* Speed bar */}
                <div className="flex w-1 flex-col self-stretch overflow-hidden rounded-full bg-gray-800">
                  <div
                    className={`mt-auto rounded-full ${level.bar} transition-all`}
                    style={{ height: `${level.pct}%` }}
                  />
                </div>

                {/* Label + time */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{level.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{level.time}</p>
                </div>

                {/* Value */}
                <div className="text-right">
                  <p className={`text-2xl font-bold tabular-nums ${level.color}`}>{value}</p>
                  <p className="text-[11px] text-gray-600">gwei</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
