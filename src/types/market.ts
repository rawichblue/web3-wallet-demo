export interface Token {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
  price_change_percentage_7d?: number
  circulating_supply: number
  total_supply: number | null
  ath: number
  ath_date: string
  sparkline?: number[]
}

export interface PricePoint {
  timestamp: number
  price: number
}

export interface MarketStats {
  total_market_cap: number
  total_volume: number
  market_cap_change_percentage_24h: number
  bitcoin_dominance: number
}

export interface GasPrice {
  slow: number
  standard: number
  fast: number
  unit: string
}

export interface TokenDexInfo {
  dexId: string
  dexName: string
  pairAddress: string
  baseToken: { address: string; name: string; symbol: string }
  quoteToken: { address: string; name: string; symbol: string }
  priceUsd: string
  volume24h: number
  liquidity: number
  chainId: string
}
