import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Token, PricePoint, MarketStats, GasPrice } from '@/types/market'
import { getTopTokens, getPriceHistory, getMarketStats } from '@/lib/api/coingecko'
import { getGasPrice } from '@/lib/api/alchemy'
import { MOCK_GAS_PRICE } from '@/mock/tokens'
import { sliceName } from './types'

export const fetchTokensService = createAsyncThunk(
  `${sliceName}/fetchTokensService`,
  async (): Promise<Token[]> => {
    const result = await getTopTokens(20)
    console.log('[CoinGecko] fetchTokensService →', result)
    return result
  }
)

export const fetchMarketStatsService = createAsyncThunk(
  `${sliceName}/fetchMarketStatsService`,
  async (): Promise<MarketStats> => {
    const result = await getMarketStats()
    console.log('[CoinGecko] fetchMarketStatsService →', result)
    return result
  }
)

export const fetchGasPriceService = createAsyncThunk(
  `${sliceName}/fetchGasPriceService`,
  async (): Promise<GasPrice> => {
    try {
      const result = await getGasPrice(1)
      console.log('[Alchemy] fetchGasPriceService →', result)
      return result
    } catch (err) {
      console.warn('[Alchemy] fetchGasPriceService failed, using mock →', err)
      return MOCK_GAS_PRICE
    }
  }
)

export interface ReqFetchPriceHistory {
  tokenId: string
  days: number
}

export const fetchPriceHistoryService = createAsyncThunk(
  `${sliceName}/fetchPriceHistoryService`,
  async ({ tokenId, days }: ReqFetchPriceHistory): Promise<PricePoint[]> => {
    const result = await getPriceHistory(tokenId, days)
    console.log(`[CoinGecko] fetchPriceHistoryService (${tokenId}, ${days}d) → ${result.length} points, sample:`, result.slice(0, 3))
    return result
  }
)
