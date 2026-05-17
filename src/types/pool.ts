export interface Pool {
  id: string
  pairAddress: string
  dexId: string
  dexName: string
  chainId: string
  chainName: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceUsd: number
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
  liquidity: number
  fdv: number
  createdAt: string
}

export type ChainFilter = 'all' | 'ethereum' | 'bsc' | 'polygon' | 'arbitrum'
export type SortField = 'liquidity' | 'volume' | 'priceChange'
export type SortOrder = 'asc' | 'desc'
