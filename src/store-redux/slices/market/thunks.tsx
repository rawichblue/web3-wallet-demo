import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Token, PricePoint, MarketStats, GasPrice, TokenDexInfo } from '@/types/market'
import type {
  CoinGeckoMarketItem,
  CoinGeckoCoinDetail,
  CoinGeckoGlobalResponse,
  DexScreenerPair,
  AlchemyGasPriceResponse,
} from '@/types/api'
import { sliceName } from './types'

// ─── HTTP clients (call Next.js proxy routes — CORS-safe) ────────────────────

const cgClient  = axios.create({ baseURL: '/api/coingecko' })
const dexClient = axios.create({ baseURL: '/api/dexscreener' })

async function alchemyPost<T>(body: Record<string, unknown>, chainId = 1): Promise<T> {
  const { data } = await axios.post<T>('/api/alchemy', { ...body, chainId })
  return data
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapMarketItem(item: CoinGeckoMarketItem): Token {
  return {
    id:                          item.id,
    symbol:                      item.symbol,
    name:                        item.name,
    image:                       item.image,
    current_price:               item.current_price               ?? 0,
    market_cap:                  item.market_cap                  ?? 0,
    market_cap_rank:             item.market_cap_rank             ?? 0,
    total_volume:                item.total_volume                ?? 0,
    price_change_percentage_24h: item.price_change_percentage_24h ?? 0,
    price_change_percentage_7d:  item.price_change_percentage_7d_in_currency ?? 0,
    circulating_supply:          item.circulating_supply          ?? 0,
    total_supply:                item.total_supply,
    ath:                         item.ath                         ?? 0,
    ath_date:                    item.ath_date                    ?? '',
  }
}

const DEX_NAME_MAP: Record<string, string> = {
  uniswap:     'Uniswap V3',
  uniswap_v2:  'Uniswap V2',
  pancakeswap: 'PancakeSwap',
  sushiswap:   'SushiSwap',
  curve:       'Curve',
  balancer:    'Balancer',
  camelot:     'Camelot',
  trader_joe:  'Trader Joe',
}

function mapPairToDexInfo(p: DexScreenerPair): TokenDexInfo {
  return {
    dexId:       p.dexId,
    dexName:     DEX_NAME_MAP[p.dexId] ?? p.dexId,
    pairAddress: p.pairAddress,
    baseToken:   p.baseToken,
    quoteToken:  p.quoteToken,
    priceUsd:    p.priceUsd,
    volume24h:   p.volume?.h24   ?? 0,
    liquidity:   p.liquidity?.usd ?? 0,
    chainId:     p.chainId,
  }
}

// ─── Thunks ──────────────────────────────────────────────────────────────────

export interface FetchTokensArgs {
  page?:    number  // 1-based, default 1
  perPage?: number  // default 20
}

export const fetchTokensService = createAsyncThunk(
  `${sliceName}/fetchTokensService`,
  async (args: FetchTokensArgs | void): Promise<Token[]> => {
    const page    = args?.page    ?? 1
    const perPage = args?.perPage ?? 20
    const { data } = await cgClient.get<CoinGeckoMarketItem[]>('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page,
        sparkline: false,
        price_change_percentage: '24h,7d',
      },
    })
    return data.map(mapMarketItem)
  }
)

export const fetchMarketStatsService = createAsyncThunk(
  `${sliceName}/fetchMarketStatsService`,
  async (): Promise<MarketStats> => {
    const { data } = await cgClient.get<CoinGeckoGlobalResponse>('/global')
    return {
      total_market_cap:               data.data.total_market_cap['usd']  ?? 0,
      total_volume:                   data.data.total_volume['usd']       ?? 0,
      market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
      bitcoin_dominance:              data.data.market_cap_percentage['btc'] ?? 0,
    }
  }
)

export const fetchGasPriceService = createAsyncThunk(
  `${sliceName}/fetchGasPriceService`,
  async (chainId: number = 1): Promise<GasPrice> => {
    const data = await alchemyPost<AlchemyGasPriceResponse>(
      { jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] },
      chainId,
    )
    const gwei = parseInt(data.result, 16) / 1e9
    return {
      slow:     Math.round(gwei * 0.8),
      standard: Math.round(gwei),
      fast:     Math.round(gwei * 1.4),
      unit:     'gwei',
    }
  }
)

export interface ReqFetchPriceHistory { tokenId: string; days: number }

export const fetchPriceHistoryService = createAsyncThunk(
  `${sliceName}/fetchPriceHistoryService`,
  async ({ tokenId, days }: ReqFetchPriceHistory): Promise<PricePoint[]> => {
    const { data } = await cgClient.get<{ prices: [number, number][] }>(
      `/coins/${tokenId}/market_chart`,
      { params: { vs_currency: 'usd', days, interval: days <= 1 ? 'hourly' : 'daily' } }
    )
    return data.prices.map(([timestamp, price]) => ({ timestamp, price }))
  }
)

export const fetchTokenDetailService = createAsyncThunk(
  `${sliceName}/fetchTokenDetailService`,
  async (id: string): Promise<Token> => {
    const { data } = await cgClient.get<CoinGeckoCoinDetail>(`/coins/${id}`, {
      params: { localization: false, tickers: false, market_data: true, community_data: false, developer_data: false },
    })
    return {
      id:                           data.id,
      symbol:                       data.symbol,
      name:                         data.name,
      image:                        data.image.large,
      current_price:                data.market_data.current_price['usd']  ?? 0,
      market_cap:                   data.market_data.market_cap['usd']      ?? 0,
      market_cap_rank:              data.market_cap_rank,
      total_volume:                 data.market_data.total_volume['usd']    ?? 0,
      price_change_percentage_24h:  data.market_data.price_change_percentage_24h ?? 0,
      circulating_supply:           data.market_data.circulating_supply          ?? 0,
      total_supply:                 data.market_data.total_supply,
      ath:                          data.market_data.ath['usd']             ?? 0,
      ath_date:                     data.market_data.ath_date['usd']        ?? '',
      contractAddress:              data.platforms?.['ethereum'] ?? null,
    }
  }
)

export const fetchTokenDexInfoService = createAsyncThunk(
  `${sliceName}/fetchTokenDexInfoService`,
  async (contractAddress: string): Promise<TokenDexInfo[]> => {
    const { data } = await dexClient.get<DexScreenerPair[]>(
      `/tokens/v1/ethereum/${contractAddress}`
    )
    const pairs = Array.isArray(data) ? data : []
    return pairs.slice(0, 5).map(mapPairToDexInfo)
  }
)
