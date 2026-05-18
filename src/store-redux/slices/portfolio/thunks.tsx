import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Holding, Transaction, PortfolioSummary } from '@/types/portfolio'
import type {
  AlchemyTokenBalancesResponse,
  AlchemyTokenBalance,
  AlchemyTokenMetadata,
  AlchemyTokenMetadataResponse,
  AlchemyTransfersResponse,
  AlchemyTransfer,
} from '@/types/api'
import { sliceName } from './types'

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function alchemyPost<T>(body: Record<string, unknown>, chainId = 1): Promise<T> {
  const { data } = await axios.post<T>('/api/alchemy', { ...body, chainId })
  return data
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Alchemy returns this sentinel value for tokens with zero balance.
// The wallet may have interacted with these tokens in the past (transfers, approvals, etc.)
// but currently holds none. We keep them in state so users can optionally see their history.
const ZERO_BALANCE = '0x0000000000000000000000000000000000000000000000000000000000000000'

// Chains that support Alchemy-specific JSON-RPC methods (alchemy_getTokenBalances etc.)
// Fantom (250) uses a public RPC which doesn't support these methods.
const ALCHEMY_SUPPORTED = new Set([1, 56, 137, 42161, 8453, 43114, 324])

const CHAIN_NAMES: Record<number, string> = {
  250: 'Fantom',
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapBalanceToHolding(
  b: AlchemyTokenBalance,
  chainId: number,
  meta: AlchemyTokenMetadata | null,
  isZeroBalance: boolean,
): Holding {
  const decimals        = meta?.decimals ?? 18
  const rawBalance      = BigInt(b.tokenBalance)
  const balanceFormatted = Number(rawBalance) / 10 ** decimals

  return {
    tokenAddress:    b.contractAddress,
    symbol:          meta?.symbol ?? '???',
    name:            meta?.name   ?? 'Unknown Token',
    decimals,
    balance:         b.tokenBalance,
    balanceFormatted,
    priceUsd:        0,
    valueUsd:        0,
    change24h:       0,
    logoUrl:         meta?.logo ?? undefined,
    chainId:         String(chainId),
    isZeroBalance,
  }
}

function mapTransferToTx(t: AlchemyTransfer, address: string, chainId: number): Transaction {
  return {
    hash:           t.hash,
    from:           t.from,
    to:             t.to ?? '',
    value:          String(t.value),
    valueFormatted: t.value,
    type:           t.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
    timestamp:      t.metadata?.blockTimestamp
                      ? Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000)
                      : 0,
    status:         'success',
    gasUsed:        '0',
    chainId:        String(chainId),
    tokenSymbol:    t.asset ?? undefined,
  }
}

function buildSummary(holdings: Holding[]): PortfolioSummary {
  // Summary counts and values only for tokens actually held (non-zero)
  const active   = holdings.filter((h) => !h.isZeroBalance)
  const totalValue = active.reduce((sum, h) => sum + h.valueUsd, 0)
  const change24h  = active.reduce((sum, h) => sum + h.valueUsd * (h.change24h / 100), 0)
  return {
    totalValueUsd:    totalValue,
    change24hUsd:     change24h,
    change24hPercent: totalValue > 0 ? (change24h / totalValue) * 100 : 0,
    holdingsCount:    active.length,
  }
}

// ─── Thunks ──────────────────────────────────────────────────────────────────

export interface ResPortfolio {
  holdings: Holding[]
  summary:  PortfolioSummary
}

export interface PortfolioArgs {
  address: string
  chainId: number
}

export const fetchPortfolioService = createAsyncThunk(
  `${sliceName}/fetchPortfolioService`,
  async ({ address, chainId }: PortfolioArgs): Promise<ResPortfolio> => {
    if (!ALCHEMY_SUPPORTED.has(chainId)) {
      const name = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`
      throw new Error(`${name} is not supported. Token balances are available on Ethereum, BNB Chain, Polygon, Arbitrum, Base, Avalanche, and zkSync Era.`)
    }

    // 1. Get ALL ERC-20 balances (including zero-balance historical tokens)
    const balanceData = await alchemyPost<AlchemyTokenBalancesResponse>({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getTokenBalances',
      params: [address, 'erc20'],
    }, chainId)

    const allBalances  = balanceData.result.tokenBalances
    const nonZero      = allBalances.filter((b) => b.tokenBalance !== ZERO_BALANCE)
    const zeroBalances = allBalances.filter((b) => b.tokenBalance === ZERO_BALANCE)

    // 2. Fetch real decimals + name + symbol only for tokens actually held.
    //    Using allSettled so one bad call doesn't break the whole portfolio.
    const metaResults = await Promise.allSettled(
      nonZero.map((b) =>
        alchemyPost<AlchemyTokenMetadataResponse>({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenMetadata',
          params: [b.contractAddress],
        }, chainId),
      ),
    )

    // 3. Map held tokens with real metadata
    const activeHoldings: Holding[] = nonZero.map((b, i) => {
      const settled = metaResults[i]
      const meta    = settled?.status === 'fulfilled' ? settled.value.result : null
      return mapBalanceToHolding(b, chainId, meta, false)
    })

    // 4. Map zero-balance tokens without metadata (no API call needed — balance is 0)
    const dustHoldings: Holding[] = zeroBalances.map((b) =>
      mapBalanceToHolding(b, chainId, null, true),
    )

    const holdings = [...activeHoldings, ...dustHoldings]
    return { holdings, summary: buildSummary(holdings) }
  }
)

export const fetchTransactionsService = createAsyncThunk(
  `${sliceName}/fetchTransactionsService`,
  async ({ address, chainId }: PortfolioArgs): Promise<Transaction[]> => {
    if (!ALCHEMY_SUPPORTED.has(chainId)) {
      throw new Error(`Transaction history not available on ${CHAIN_NAMES[chainId] ?? `Chain ${chainId}`}.`)
    }

    const data = await alchemyPost<AlchemyTransfersResponse>({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [{
        fromAddress: address,
        category:    ['external', 'erc20'],
        maxCount:    '0x14',
        order:       'desc',
        withMetadata: true,
      }],
    }, chainId)
    return data.result.transfers.map((t) => mapTransferToTx(t, address, chainId))
  }
)
