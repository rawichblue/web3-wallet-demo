import { createSlice } from '@reduxjs/toolkit'
import { sliceName, initialState, type StateProps } from './types'
import { fetchPortfolioService, fetchTransactionsService } from './thunks'
import type { RootState } from '@/store-redux/store'

const portfolioSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    clearAll: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPortfolioService.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchPortfolioService.fulfilled, (state, action) => {
      state.loading = false
      state.holdings = action.payload.holdings
      state.summary = action.payload.summary
    })
    builder.addCase(fetchPortfolioService.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message ?? 'Failed to fetch portfolio'
    })

    builder.addCase(fetchTransactionsService.pending, (state) => {
      state.loadingTx = true
    })
    builder.addCase(fetchTransactionsService.fulfilled, (state, action) => {
      state.loadingTx = false
      state.transactions = action.payload
    })
    builder.addCase(fetchTransactionsService.rejected, (state) => {
      state.loadingTx = false
    })
  },
})

export const { clearAll: clearPortfolio } = portfolioSlice.actions
export default portfolioSlice.reducer
export const portfolioSelector = (state: RootState): StateProps => state.portfolioSlice
