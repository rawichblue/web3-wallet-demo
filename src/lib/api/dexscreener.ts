import axios from "axios";
import type { Pool, ChainFilter } from "@/types/pool";
import type { TokenDexInfo } from "@/types/market";
import type { DexScreenerPair } from "@/types/api";

// Calls go through /api/dexscreener proxy (Next.js route handler) to avoid CORS.
// DexScreener v2: /tokens/v1/{chain}/{address,...}  (old /latest/dex/pairs/{chain} removed)

const BASE_URL = "/api/dexscreener";

const client = axios.create({ baseURL: BASE_URL });

// Top liquid token addresses per chain — used to seed "top pools" query
const TOP_TOKENS: Record<string, string[]> = {
  ethereum: [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // MATIC
    "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
  ],
  bsc: [
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC
    "0x55d398326f99059fF775485246999027B3197955", // USDT
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", // CAKE
  ],
  polygon: [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
  ],
  arbitrum: [
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
    "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
    "0xFC5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", // GMX
  ],
};

const DEX_NAME_MAP: Record<string, string> = {
  uniswap: "Uniswap V3",
  uniswap_v2: "Uniswap V2",
  pancakeswap: "PancakeSwap",
  sushiswap: "SushiSwap",
  curve: "Curve",
  balancer: "Balancer",
  camelot: "Camelot",
  trader_joe: "Trader Joe",
};

const CHAIN_NAME_MAP: Record<string, string> = {
  ethereum: "Ethereum",
  bsc: "BNB Chain",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
};

function formatDexName(dexId: string): string {
  return DEX_NAME_MAP[dexId] ?? dexId;
}

function formatChainName(chainId: string): string {
  return CHAIN_NAME_MAP[chainId] ?? chainId;
}

function mapPairToPool(p: DexScreenerPair): Pool {
  return {
    id: p.pairAddress,
    pairAddress: p.pairAddress,
    dexId: p.dexId,
    dexName: formatDexName(p.dexId),
    chainId: p.chainId,
    chainName: formatChainName(p.chainId),
    baseToken: p.baseToken,
    quoteToken: p.quoteToken,
    priceUsd: parseFloat(p.priceUsd) || 0,
    priceChange: {
      h1: p.priceChange?.h1 ?? 0,
      h6: p.priceChange?.h6 ?? 0,
      h24: p.priceChange?.h24 ?? 0,
    },
    volume: {
      h1: p.volume?.h1 ?? 0,
      h6: p.volume?.h6 ?? 0,
      h24: p.volume?.h24 ?? 0,
    },
    liquidity: p.liquidity?.usd ?? 0,
    fdv: p.fdv ?? 0,
    createdAt: p.pairCreatedAt
      ? new Date(p.pairCreatedAt).toISOString().split("T")[0] ?? ""
      : "",
  };
}

export async function getPools(chain: ChainFilter): Promise<Pool[]> {
  const chains =
    chain === "all"
      ? (["ethereum", "bsc", "polygon", "arbitrum"] as const)
      : [chain];

  const results = await Promise.all(
    chains.map(async (c) => {
      const addresses = (TOP_TOKENS[c] ?? []).join(",");
      if (!addresses) return [];
      const { data } = await client.get<DexScreenerPair[]>(
        `/tokens/v1/${c}/${addresses}`
      );
      const pairs = Array.isArray(data) ? data : [];

      // Deduplicate by pairAddress (same pair can appear multiple times when querying multiple tokens)
      const seen = new Set<string>();
      const unique = pairs.filter((p) => {
        if (seen.has(p.pairAddress)) return false;
        seen.add(p.pairAddress);
        return true;
      });

      return unique
        .filter((p) => p.liquidity?.usd && p.liquidity.usd > 10_000)
        .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
        .slice(0, chain === "all" ? 5 : 20)
        .map(mapPairToPool);
    })
  );

  return results.flat();
}

export async function getTokenDexInfo(
  tokenAddress: string
): Promise<TokenDexInfo[]> {
  const { data } = await client.get<DexScreenerPair[]>(
    `/tokens/v1/ethereum/${tokenAddress}`
  );
  const pairs = Array.isArray(data) ? data : [];
  return pairs.slice(0, 5).map(
    (p): TokenDexInfo => ({
      dexId: p.dexId,
      dexName: formatDexName(p.dexId),
      pairAddress: p.pairAddress,
      baseToken: p.baseToken,
      quoteToken: p.quoteToken,
      priceUsd: p.priceUsd,
      volume24h: p.volume?.h24 ?? 0,
      liquidity: p.liquidity?.usd ?? 0,
      chainId: p.chainId,
    })
  );
}
