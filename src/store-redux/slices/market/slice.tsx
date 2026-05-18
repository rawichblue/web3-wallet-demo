import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Token } from '@/types/market'
import { sliceName, initialState, type StateProps } from './types'
import {
  fetchTokensService,
  fetchMarketStatsService,
  fetchGasPriceService,
  fetchPriceHistoryService,
  fetchTokenDetailService,
  fetchTokenDexInfoService,
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
    builder.addCase(fetchMarketStatsService.pending, (state) => { state.errorStats = null })
    builder.addCase(fetchMarketStatsService.fulfilled, (state, action) => {
      state.marketStats = action.payload
      state.errorStats = null
    })
    builder.addCase(fetchMarketStatsService.rejected, (state, action) => {
      state.errorStats = action.error.message ?? 'Failed to fetch market stats'
    })

    // fetchGasPrice
    builder.addCase(fetchGasPriceService.pending, (state) => { state.errorGas = null })
    builder.addCase(fetchGasPriceService.fulfilled, (state, action) => {
      state.gasPrice = action.payload
      state.errorGas = null
    })
    builder.addCase(fetchGasPriceService.rejected, (state, action) => {
      state.errorGas = action.error.message ?? 'Failed to fetch gas price'
    })

    // fetchPriceHistory
    builder.addCase(fetchPriceHistoryService.pending, (state) => {
      state.loadingPriceHistory = true
      state.priceHistory = []        // clear stale data so old period never bleeds into new one
      state.errorChart = null
    })
    builder.addCase(fetchPriceHistoryService.fulfilled, (state, action) => {
      state.loadingPriceHistory = false
      state.priceHistory = action.payload
      state.errorChart = null
    })
    builder.addCase(fetchPriceHistoryService.rejected, (state, action) => {
      state.loadingPriceHistory = false
      state.errorChart = action.error.message ?? 'Failed to fetch price history'
    })

    // fetchTokenDetail
    builder.addCase(fetchTokenDetailService.fulfilled, (state, action) => {
      const idx = state.tokens.findIndex((t) => t.id === action.payload.id)
      if (idx >= 0) state.tokens[idx] = action.payload
      else state.tokens.push(action.payload)
    })

    // fetchTokenDexInfo
    builder.addCase(fetchTokenDexInfoService.pending, (state) => {
      state.loadingDexInfo = true
      state.errorDexInfo = null
      state.dexInfo = []
    })
    builder.addCase(fetchTokenDexInfoService.fulfilled, (state, action) => {
      state.loadingDexInfo = false
      state.dexInfo = action.payload
    })
    builder.addCase(fetchTokenDexInfoService.rejected, (state, action) => {
      state.loadingDexInfo = false
      state.errorDexInfo = action.error.message ?? 'Failed to fetch DEX info'
    })
  },
})

export const { setSelectedToken, clearPriceHistory, clearAll: clearMarket } = marketSlice.actions
export default marketSlice.reducer
export const marketSelector = (state: RootState): StateProps => state.marketSlice
