import type { Chain } from '@/types/chain'

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_ETH_RPC ?? '',
    blockExplorer: 'https://etherscan.io',
    iconUrl: '/chains/ethereum.svg',
    color: '#627EEA',
  },
  {
    id: 56,
    name: 'BNB Chain',
    shortName: 'BSC',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrl: 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com',
    iconUrl: '/chains/bsc.svg',
    color: '#F3BA2F',
  },
  {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_RPC ?? '',
    blockExplorer: 'https://polygonscan.com',
    iconUrl: '/chains/polygon.svg',
    color: '#8247E5',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    shortName: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_ARB_RPC ?? '',
    blockExplorer: 'https://arbiscan.io',
    iconUrl: '/chains/arbitrum.svg',
    color: '#28A0F0',
  },
]

export const DEFAULT_CHAIN: Chain = SUPPORTED_CHAINS[0]!

export const CHAIN_ID_TO_DEXSCREENER: Record<number, string> = {
  1: 'ethereum',
  56: 'bsc',
  137: 'polygon',
  42161: 'arbitrum',
}
