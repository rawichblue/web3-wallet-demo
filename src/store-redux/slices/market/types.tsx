import type { Token, PricePoint, MarketStats, GasPrice } from '@/types/market'

export const sliceName = 'market'

export interface StateProps {
  tokens: Token[]
  selectedToken: Token | null
  priceHistory: PricePoint[]
  marketStats: MarketStats | null
  gasPrice: GasPrice | null
  loading: boolean
  loadingPriceHistory: boolean
  error: string | null
}

export const initialState: StateProps = {
  tokens: [],
  selectedToken: null,
  priceHistory: [],
  marketStats: null,
  gasPrice: null,
  loading: false,
  loadingPriceHistory: false,
  error: null,
}
