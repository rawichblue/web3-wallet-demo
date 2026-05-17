import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Holding, Transaction, PortfolioSummary } from '@/types/portfolio'
import { getTokenBalances, getTransactionHistory } from '@/lib/api/alchemy'
import { MOCK_HOLDINGS, MOCK_TRANSACTIONS } from '@/mock/transactions'
import { sliceName } from './types'

export interface ResPortfolio {
  holdings: Holding[]
  summary: PortfolioSummary
}

function buildSummary(holdings: Holding[]): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.valueUsd, 0)
  const change24h = holdings.reduce((sum, h) => sum + h.valueUsd * (h.change24h / 100), 0)
  return {
    totalValueUsd: totalValue,
    change24hUsd: change24h,
    change24hPercent: totalValue > 0 ? (change24h / totalValue) * 100 : 0,
    holdingsCount: holdings.length,
  }
}

export const fetchPortfolioService = createAsyncThunk(
  `${sliceName}/fetchPortfolioService`,
  async (address: string): Promise<ResPortfolio> => {
    try {
      const holdings = await getTokenBalances(address, 1)
      console.log('[Alchemy] fetchPortfolioService →', holdings)
      return { holdings, summary: buildSummary(holdings) }
    } catch (err) {
      console.warn('[Alchemy] fetchPortfolioService failed, using mock →', err)
      return { holdings: MOCK_HOLDINGS, summary: buildSummary(MOCK_HOLDINGS) }
    }
  }
)

export const fetchTransactionsService = createAsyncThunk(
  `${sliceName}/fetchTransactionsService`,
  async (address: string): Promise<Transaction[]> => {
    try {
      const result = await getTransactionHistory(address, 1)
      console.log('[Alchemy] fetchTransactionsService →', result)
      return result
    } catch (err) {
      console.warn('[Alchemy] fetchTransactionsService failed, using mock →', err)
      return MOCK_TRANSACTIONS
    }
  }
)
