import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Token } from '@/types/market'
import { sliceName, initialState, type StateProps } from './types'
import {
  fetchTokensService,
  fetchMarketStatsService,
  fetchGasPriceService,
  fetchPriceHistoryService,
} from './thunks'
import type { RootState } from '@/store-redux/store'

const marketSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setSelectedToken: (state, action: PayloadAction<Token | null>) => {
      state.selectedToken = action.payload
    },
    clearPriceHistory: (state) => {
      state.priceHistory = []
      state.loadingPriceHistory = false
    },
    clearAll: () => initialState,
  },
  extraReducers: (builder) => {
    // fetchTokens
    builder.addCase(fetchTokensService.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchTokensService.fulfilled, (state, action) => {
      state.loading = false
      state.tokens = action.payload
    })
    builder.addCase(fetchTokensService.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message ?? 'Failed to fetch tokens'
    })

    // fetchMarketStats
    builder.addCase(fetchMarketStatsService.fulfilled, (state, action) => {
      state.marketStats = action.payload
    })

    // fetchGasPrice
    builder.addCase(fetchGasPriceService.fulfilled, (state, action) => {
      state.gasPrice = action.payload
    })

    // fetchPriceHistory
    builder.addCase(fetchPriceHistoryService.pending, (state) => {
      state.loadingPriceHistory = true
    })
    builder.addCase(fetchPriceHistoryService.fulfilled, (state, action) => {
      state.loadingPriceHistory = false
      state.priceHistory = action.payload
    })
    builder.addCase(fetchPriceHistoryService.rejected, (state) => {
      state.loadingPriceHistory = false
    })
  },
})

export const { setSelectedToken, clearPriceHistory, clearAll: clearMarket } = marketSlice.actions
export default marketSlice.reducer
export const marketSelector = (state: RootState): StateProps => state.marketSlice
