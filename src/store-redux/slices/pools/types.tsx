import type { Pool, ChainFilter, SortField, SortOrder } from '@/types/pool'

export const sliceName = 'pools'

export interface StateProps {
  pools: Pool[]
  chainFilter: ChainFilter
  sortField: SortField
  sortOrder: SortOrder
  loading: boolean
  error: string | null
}

export const initialState: StateProps = {
  pools: [],
  chainFilter: 'all',
  sortField: 'liquidity',
  sortOrder: 'desc',
  loading: false,
  error: null,
}
