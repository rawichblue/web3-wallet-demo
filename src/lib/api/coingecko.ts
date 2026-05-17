import axios from 'axios'
import type { Token, PricePoint, MarketStats } from '@/types/market'
import type {
  CoinGeckoMarketItem,
  CoinGeckoCoinDetail,
  CoinGeckoSearchResponse,
  CoinGeckoGlobalResponse,
} from '@/types/api'

// Calls go through /api/coingecko proxy (Next.js route handler) to avoid CORS.
// Real CoinGecko calls happen server-side.

const BASE_URL = '/api/coingecko'

const client = axios.create({ baseURL: BASE_URL })

export async function getTopTokens(limit = 10): Promise<Token[]> {
  const { data } = await client.get<CoinGeckoMarketItem[]>('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d',
    },
  })
  return data.map((item) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    image: item.image,
    current_price: item.current_price,
    market_cap: item.market_cap,
    market_cap_rank: item.market_cap_rank,
    total_volume: item.total_volume,
    price_change_percentage_24h: item.price_change_percentage_24h,
    price_change_percentage_7d: item.price_change_percentage_7d_in_currency,
    circulating_supply: item.circulating_supply,
    total_supply: item.total_supply,
    ath: item.ath,
    ath_date: item.ath_date,
  }))
}

export async function getTokenById(id: string): Promise<Token> {
  const { data } = await client.get<CoinGeckoCoinDetail>(`/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  })
  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    image: data.image.large,
    current_price: data.market_data.current_price['usd'] ?? 0,
    market_cap: data.market_data.market_cap['usd'] ?? 0,
    market_cap_rank: data.market_cap_rank,
    total_volume: data.market_data.total_volume['usd'] ?? 0,
    price_change_percentage_24h: data.market_data.price_change_percentage_24h,
    circulating_supply: data.market_data.circulating_supply,
    total_supply: data.market_data.total_supply,
    ath: data.market_data.ath['usd'] ?? 0,
    ath_date: data.market_data.ath_date['usd'] ?? '',
  }
}

export async function getPriceHistory(tokenId: string, days: number): Promise<PricePoint[]> {
  const { data } = await client.get<{ prices: [number, number][] }>(
    `/coins/${tokenId}/market_chart`,
    {
      params: {
        vs_currency: 'usd',
        days,
        interval: days <= 1 ? 'hourly' : 'daily',
      },
    }
  )
  return data.prices.map(([timestamp, price]) => ({ timestamp, price }))
}

export async function getMarketStats(): Promise<MarketStats> {
  const { data } = await client.get<CoinGeckoGlobalResponse>('/global')
  return {
    total_market_cap: data.data.total_market_cap['usd'] ?? 0,
    total_volume: data.data.total_volume['usd'] ?? 0,
    market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
    bitcoin_dominance: data.data.market_cap_percentage['btc'] ?? 0,
  }
}

export async function searchTokens(query: string): Promise<Token[]> {
  const { data: searchData } = await client.get<CoinGeckoSearchResponse>('/search', {
    params: { query },
  })
  const coinIds = searchData.coins
    .slice(0, 10)
    .map((c) => c.id)
    .join(',')
  if (!coinIds) return []
  const { data: markets } = await client.get<CoinGeckoMarketItem[]>('/coins/markets', {
    params: { vs_currency: 'usd', ids: coinIds },
  })
  return markets.map((item) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    image: item.image,
    current_price: item.current_price,
    market_cap: item.market_cap,
    market_cap_rank: item.market_cap_rank,
    total_volume: item.total_volume,
    price_change_percentage_24h: item.price_change_percentage_24h,
    circulating_supply: item.circulating_supply,
    total_supply: item.total_supply,
    ath: item.ath,
    ath_date: item.ath_date,
  }))
}
