export interface Holding {
  tokenAddress: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: number
  priceUsd: number
  valueUsd: number
  change24h: number
  logoUrl?: string
  chainId: string
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueFormatted: number
  type: 'send' | 'receive' | 'swap' | 'approve'
  timestamp: number
  status: 'success' | 'failed' | 'pending'
  gasUsed: string
  chainId: string
  tokenSymbol?: string
}

export interface PortfolioSummary {
  totalValueUsd: number
  change24hUsd: number
  change24hPercent: number
  holdingsCount: number
}
