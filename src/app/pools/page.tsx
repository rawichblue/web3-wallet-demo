'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { poolsSelector, fetchPoolsService, setChainFilter, setSortField, toggleSortOrder } from '@/store-redux/slices/pools'
import type { ChainFilter, SortField } from '@/types/pool'
import ChainFilterBar from '@/components/pools/ChainFilter'
import PoolTable from '@/components/pools/PoolTable'

export default function PoolsPage() {
  const dispatch = useAppDispatch()
  const { pools, chainFilter, sortField, sortOrder, loading } = useSelector(poolsSelector)

  useEffect(() => {
    dispatch(fetchPoolsService(chainFilter))
  }, [dispatch, chainFilter])

  const handleChainChange = (chain: ChainFilter) => {
    dispatch(setChainFilter(chain))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      dispatch(toggleSortOrder())
    } else {
      dispatch(setSortField(field))
    }
  }

  const sorted = [...pools].sort((a, b): number => {
    let aVal: number
    let bVal: number
    if (sortField === 'volume') {
      aVal = a.volume.h24
      bVal = b.volume.h24
    } else if (sortField === 'priceChange') {
      aVal = a.priceChange.h24
      bVal = b.priceChange.h24
    } else {
      aVal = a.liquidity
      bVal = b.liquidity
    }
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Liquidity Pools</h1>
        <p className="mt-1 text-sm text-gray-400">
          {pools.length > 0 ? `${pools.length} pools across all chains` : 'Loading...'}
        </p>
      </div>

      <ChainFilterBar active={chainFilter} onChange={handleChainChange} />

      <PoolTable
        pools={sorted}
        loading={loading}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
