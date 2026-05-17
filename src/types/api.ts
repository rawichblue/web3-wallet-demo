// ─── CoinGecko ───────────────────────────────────────────────────────────────

export interface CoinGeckoMarketItem {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  circulating_supply: number
  total_supply: number | null
  ath: number
  ath_date: string
}

export interface CoinGeckoCoinDetail {
  id: string
  symbol: string
  name: string
  market_cap_rank: number
  image: {
    thumb: string
    small: string
    large: string
  }
  market_data: {
    current_price: Record<string, number>
    market_cap: Record<string, number>
    total_volume: Record<string, number>
    price_change_percentage_24h: number
    circulating_supply: number
    total_supply: number | null
    ath: Record<string, number>
    ath_date: Record<string, string>
  }
}

export interface CoinGeckoSearchCoin {
  id: string
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
}

export interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchCoin[]
}

export interface CoinGeckoGlobalResponse {
  data: {
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_change_percentage_24h_usd: number
    market_cap_percentage: Record<string, number>
  }
}

// ─── DexScreener ─────────────────────────────────────────────────────────────

export interface DexScreenerToken {
  address: string
  name: string
  symbol: string
}

export interface DexScreenerPair {
  pairAddress: string
  dexId: string
  chainId: string
  baseToken: DexScreenerToken
  quoteToken: DexScreenerToken
  priceUsd: string
  priceChange: {
    h1: number
    h6: number
    h24: number
  }
  volume: {
    h24: number
    h6: number
    h1: number
  }
  liquidity: {
    usd: number
  }
  fdv: number
  pairCreatedAt: number
}

export interface DexScreenerPairsResponse {
  pairs: DexScreenerPair[] | null
}

// ─── Alchemy ─────────────────────────────────────────────────────────────────

export interface AlchemyTokenBalance {
  contractAddress: string
  tokenBalance: string
}

export interface AlchemyTokenBalancesResponse {
  result: {
    address: string
    tokenBalances: AlchemyTokenBalance[]
  }
}

export interface AlchemyTransferMetadata {
  blockTimestamp: string
}

export interface AlchemyTransfer {
  hash: string
  from: string
  to: string | null
  value: number
  asset: string | null
  metadata: AlchemyTransferMetadata
  category: string
}

export interface AlchemyTransfersResponse {
  result: {
    transfers: AlchemyTransfer[]
  }
}

export interface AlchemyGasPriceResponse {
  result: string
}
