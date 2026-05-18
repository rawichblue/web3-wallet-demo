import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Pool, ChainFilter } from '@/types/pool'
import type { DexScreenerPair } from '@/types/api'
import { sliceName } from './types'

// ─── HTTP client ─────────────────────────────────────────────────────────────

const dexClient = axios.create({ baseURL: '/api/dexscreener' })

// ─── Seed addresses (DexScreener v2 requires token address to get pairs) ─────

const TOP_TOKENS: Record<string, string[]> = {
  ethereum: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  ],
  bsc: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
    '0x55d398326f99059fF775485246999027B3197955', // USDT
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', // CAKE
  ],
  polygon: [
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
  ],
  arbitrum: [
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
    '0xFC5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', // GMX
  ],
  base: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH
    '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AERO
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
  ],
  avalanche: [
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
    '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd', // JOE
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH.e
  ],
  zksync: [
    '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', // WETH
    '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', // USDC
    '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C', // USDT
    '0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E', // ZK
  ],
}

const ALL_CHAINS = Object.keys(TOP_TOKENS) as (keyof typeof TOP_TOKENS)[]

// ─── Mappers ─────────────────────────────────────────────────────────────────

const DEX_NAME_MAP: Record<string, string> = {
  uniswap:          'Uniswap V3',
  uniswap_v2:       'Uniswap V2',
  pancakeswap:      'PancakeSwap',
  pancakeswap_v3:   'PancakeSwap V3',
  sushiswap:        'SushiSwap',
  curve:            'Curve',
  balancer:         'Balancer',
  camelot:          'Camelot',
  trader_joe:       'Trader Joe',
  velodrome:        'Velodrome',
  aerodrome:        'Aerodrome',
  spookyswap:       'SpookySwap',
  syncswap:         'SyncSwap',
  mute:             'Mute.io',
  lynex:            'Lynex',
}

const CHAIN_NAME_MAP: Record<string, string> = {
  ethereum: 'Ethereum',
  bsc:      'BNB Chain',
  polygon:  'Polygon',
  arbitrum: 'Arbitrum',
  base:     'Base',
  avalanche:'Avalanche',
  zksync:   'zkSync Era',
}

function mapPairToPool(p: DexScreenerPair): Pool {
  return {
    id:          p.pairAddress,
    pairAddress: p.pairAddress,
    dexId:       p.dexId,
    dexName:     DEX_NAME_MAP[p.dexId] ?? (p.dexId.startsWith('0x') ? 'Unknown DEX' : p.dexId),
    chainId:     p.chainId,
    chainName:   CHAIN_NAME_MAP[p.chainId] ?? p.chainId,
    baseToken:   p.baseToken,
    quoteToken:  p.quoteToken,
    priceUsd:    parseFloat(p.priceUsd) || 0,
    priceChange: { h1: p.priceChange?.h1 ?? 0, h6: p.priceChange?.h6 ?? 0, h24: p.priceChange?.h24 ?? 0 },
    volume:      { h1: p.volume?.h1    ?? 0, h6: p.volume?.h6    ?? 0, h24: p.volume?.h24    ?? 0 },
    liquidity:   p.liquidity?.usd ?? 0,
    fdv:         p.fdv ?? 0,
    createdAt:   p.pairCreatedAt ? new Date(p.pairCreatedAt).toISOString().split('T')[0] ?? '' : '',
  }
}

// ─── Thunk ───────────────────────────────────────────────────────────────────

export const fetchPoolsService = createAsyncThunk(
  `${sliceName}/fetchPoolsService`,
  async (chain: ChainFilter): Promise<Pool[]> => {
    const chains = chain === 'all' ? ALL_CHAINS : [chain]

    const results = await Promise.all(
      chains.map(async (c) => {
        const addresses = (TOP_TOKENS[c] ?? []).join(',')
        if (!addresses) return []

        const { data } = await dexClient.get<DexScreenerPair[]>(`/tokens/v1/${c}/${addresses}`)
        const pairs = Array.isArray(data) ? data : []

        const seen = new Set<string>()
        return pairs
          .filter((p) => { if (seen.has(p.pairAddress)) return false; seen.add(p.pairAddress); return true })
          .filter((p) => (p.liquidity?.usd ?? 0) > 10_000)
          .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
          .slice(0, chain === 'all' ? 3 : 20)
          .map(mapPairToPool)
      })
    )

    return results.flat()
  }
)
