import axios from 'axios'
import type { Holding, Transaction } from '@/types/portfolio'
import type { GasPrice } from '@/types/market'
import type {
  AlchemyTokenBalancesResponse,
  AlchemyTokenBalance,
  AlchemyTransfersResponse,
  AlchemyTransfer,
  AlchemyGasPriceResponse,
} from '@/types/api'

// Calls go through /api/alchemy proxy (Next.js route handler).
// API key lives in ALCHEMY_API_KEY (server-only, no NEXT_PUBLIC_ prefix).

const ZERO_BALANCE = '0x0000000000000000000000000000000000000000000000000000000000000000'

function mapBalanceToHolding(b: AlchemyTokenBalance, chainId: number): Holding {
  return {
    tokenAddress: b.contractAddress,
    symbol: '???',
    name: 'Unknown',
    decimals: 18,
    balance: b.tokenBalance,
    balanceFormatted: parseInt(b.tokenBalance, 16) / 1e18,
    priceUsd: 0,
    valueUsd: 0,
    change24h: 0,
    chainId: String(chainId),
  }
}

function mapTransferToTx(t: AlchemyTransfer, address: string, chainId: number): Transaction {
  return {
    hash: t.hash,
    from: t.from,
    to: t.to ?? '',
    value: String(t.value),
    valueFormatted: t.value,
    type: t.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
    timestamp: Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000),
    status: 'success',
    gasUsed: '0',
    chainId: String(chainId),
    tokenSymbol: t.asset ?? undefined,
  }
}

async function alchemyCall<T>(body: Record<string, unknown>, chainId: number): Promise<T> {
  const { data } = await axios.post<T>('/api/alchemy', { ...body, chainId })
  return data
}

export async function getTokenBalances(
  address: string,
  chainId = 1
): Promise<Holding[]> {
  const data = await alchemyCall<AlchemyTokenBalancesResponse>(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getTokenBalances',
      params: [address, 'erc20'],
    },
    chainId
  )

  return data.result.tokenBalances
    .filter((b) => b.tokenBalance !== ZERO_BALANCE)
    .map((b) => mapBalanceToHolding(b, chainId))
}

export async function getTransactionHistory(
  address: string,
  chainId = 1
): Promise<Transaction[]> {
  const data = await alchemyCall<AlchemyTransfersResponse>(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromAddress: address,
          category: ['external', 'erc20'],
          maxCount: '0x14',
          order: 'desc',
          withMetadata: true,
        },
      ],
    },
    chainId
  )

  return data.result.transfers.map((t) => mapTransferToTx(t, address, chainId))
}

export async function getGasPrice(chainId = 1): Promise<GasPrice> {
  const data = await alchemyCall<AlchemyGasPriceResponse>(
    { jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] },
    chainId
  )

  const gweiBase = parseInt(data.result, 16) / 1e9
  return {
    slow: Math.round(gweiBase * 0.8),
    standard: Math.round(gweiBase),
    fast: Math.round(gweiBase * 1.4),
    unit: 'gwei',
  }
}
