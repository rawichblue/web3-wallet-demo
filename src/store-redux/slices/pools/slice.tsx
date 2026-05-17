import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ChainFilter, SortField, SortOrder } from '@/types/pool'
import { sliceName, initialState, type StateProps } from './types'
import { fetchPoolsService } from './thunks'
import type { RootState } from '@/store-redux/store'

const poolsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setChainFilter: (state, action: PayloadAction<ChainFilter>) => {
      state.chainFilter = action.payload
    },
    setSortField: (state, action: PayloadAction<SortField>) => {
      state.sortField = action.payload
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    clearAll: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPoolsService.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchPoolsService.fulfilled, (state, action) => {
      state.loading = false
      state.pools = action.payload
    })
    builder.addCase(fetchPoolsService.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message ?? 'Failed to fetch pools'
    })
  },
})

export const { setChainFilter, setSortField, setSortOrder, toggleSortOrder, clearAll: clearPools } = poolsSlice.actions
export default poolsSlice.reducer
export const poolsSelector = (state: RootState): StateProps => state.poolsSlice
