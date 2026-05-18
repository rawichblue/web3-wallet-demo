import type { Token, PricePoint, MarketStats, GasPrice, TokenDexInfo } from '@/types/market'

export const sliceName = 'market'

export interface StateProps {
  tokens: Token[]
  selectedToken: Token | null
  priceHistory: PricePoint[]
  marketStats: MarketStats | null
  gasPrice: GasPrice | null
  dexInfo: TokenDexInfo[]
  loading: boolean
  loadingPriceHistory: boolean
  loadingDexInfo: boolean
  error: string | null       // fetchTokens
  errorStats: string | null  // fetchMarketStats
  errorGas: string | null    // fetchGasPrice
  errorChart: string | null  // fetchPriceHistory
  errorDexInfo: string | null
}

export const initialState: StateProps = {
  tokens: [],
  selectedToken: null,
  priceHistory: [],
  marketStats: null,
  gasPrice: null,
  dexInfo: [],
  loading: false,
  loadingPriceHistory: false,
  loadingDexInfo: false,
  error: null,
  errorStats: null,
  errorGas: null,
  errorChart: null,
  errorDexInfo: null,
}
