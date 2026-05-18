# DexScope — Multi-Chain DEX Analytics Dashboard

A production-quality Web3 dashboard for real-time DeFi analytics across multiple blockchains. Built with Next.js 16, TypeScript strict mode, Redux Toolkit, wagmi v2, and live data from CoinGecko, DexScreener, and Alchemy.

---

## Features

### 📊 Dashboard
- **Market Overview** — Total market cap, 24h volume, BTC dominance, ETH price (live from CoinGecko)
- **Interactive Price Chart** — Area chart with period selector (1D / 7D / 30D / 90D) powered by Recharts
- **Gas Tracker** — Real-time Ethereum gas prices (Slow / Standard / Fast) via Alchemy
- **Top Tokens** — Top 20 tokens ranked by market cap with 24h % change

### 🪙 Token Explorer
- Sortable token table with price, 24h change, market cap, volume
- Search by name or symbol
- Token detail page with full stats + live DEX listings from DexScreener

### 💧 Liquidity Pools
- Top pools across Ethereum, BNB Chain, Polygon, Arbitrum
- Chain filter + sortable columns (Liquidity / Volume 24h / 24h %)
- Live data from DexScreener v2 API

### 💼 Portfolio
- Connect wallet → view real ERC-20 token balances via Alchemy
- Transaction history (sends / receives)
- Portfolio summary with total value and 24h P&L
- Supports chain switching — portfolio updates per connected chain

### 🔗 Wallet Connection
- **MetaMask** — browser extension
- **WalletConnect v2** — QR code for 300+ mobile wallets
- **Chain Switcher** — Ethereum / Polygon / Arbitrum / BNB Chain

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Redux Toolkit + `createAsyncThunk` |
| Web3 | wagmi v2 + viem v2 |
| Charts | Recharts 3 |
| HTTP | Axios |
| Data | CoinGecko API · DexScreener API · Alchemy |

---

## Project Structure

```
src/
├── app/
│   ├── api/                          # Next.js proxy routes (server-side, CORS-safe)
│   │   ├── alchemy/route.ts          # POST proxy → Alchemy JSON-RPC
│   │   ├── coingecko/[...path]/      # GET proxy → CoinGecko API
│   │   └── dexscreener/[...path]/    # GET proxy → DexScreener API
│   ├── page.tsx                      # Dashboard
│   ├── tokens/page.tsx               # Token explorer
│   ├── token/[id]/page.tsx           # Token detail
│   ├── pools/page.tsx                # Liquidity pools
│   └── portfolio/page.tsx            # Wallet portfolio
│
├── components/
│   ├── dashboard/    # StatCard, PriceChart, AreaChartInner, GasTracker, TokenList
│   ├── layout/       # Navbar, Footer, WalletButton
│   ├── pools/        # PoolTable, ChainFilter
│   ├── portfolio/    # BalanceCard, TxHistory, ConnectPrompt
│   ├── tokens/       # TokenTable, SearchBar
│   └── ui/           # ApiError (reusable error + retry component)
│
├── store-redux/
│   └── slices/
│       ├── market/           # Tokens, price history, market stats, gas, DEX info
│       │   ├── types.tsx     # State interface + initialState
│       │   ├── slice.tsx     # Reducers + extraReducers (all error states)
│       │   ├── thunks.tsx    # CoinGecko + Alchemy gas + DexScreener DEX info
│       │   └── index.tsx     # Barrel export
│       ├── pools/            # Liquidity pools — DexScreener v2
│       │   └── thunks.tsx    # TOP_TOKENS seed addresses + mapPairToPool
│       └── portfolio/        # Holdings + transactions — Alchemy
│           └── thunks.tsx    # alchemy_getTokenBalances + alchemy_getAssetTransfers
│
├── config/
│   └── wagmi.ts      # createConfig with injected() + metaMask() connectors
│
├── types/
│   ├── api.ts        # Raw API response shapes (CoinGecko, DexScreener, Alchemy)
│   ├── market.ts     # Token, PricePoint, MarketStats, GasPrice, TokenDexInfo
│   ├── pool.ts       # Pool, ChainFilter, SortField
│   └── portfolio.ts  # Holding, Transaction, PortfolioSummary
│
└── lib/
    └── utils/
        └── format.ts # formatPrice, formatLargeNumber, getChangeBg, getChangeColor
```

---

## Architecture

### API Proxy Pattern

All external API calls route through Next.js Route Handlers to avoid browser CORS restrictions and keep API keys server-only:

```
Browser  →  /api/coingecko/coins/markets   →  server  →  api.coingecko.com
Browser  →  /api/dexscreener/tokens/v1/..  →  server  →  api.dexscreener.com
Browser  →  /api/alchemy                   →  server  →  *.g.alchemy.com
```

The `/api/coingecko` and `/api/dexscreener` routes use `[...path]` catch-all segments so any sub-path is forwarded automatically without needing individual route files.

### Redux Data Flow

```
Page component
  └─ dispatch(thunk)
       └─ thunk calls /api/* proxy
            └─ slice extraReducer updates state
                 └─ useSelector re-renders component
```

All API logic (HTTP calls + data mapping) lives inside `store-redux/slices/*/thunks.tsx`. There is no separate `lib/api` abstraction layer.

### Error Handling

Every `createAsyncThunk` has `pending / fulfilled / rejected` handlers in the slice. On failure:

- Redux stores the error message per feature (`error`, `errorStats`, `errorGas`, `errorChart`, `errorTx`, `errorDexInfo`)
- UI renders `<ApiError message={...} onRetry={...} />` with a **Try again** button that re-dispatches the thunk

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm
- MetaMask browser extension (for wallet features)

### Installation

```bash
git clone https://github.com/your-username/dexscope.git
cd dexscope
pnpm install
```

### Environment Variables

Create `.env.local` at the project root:

```env
# Alchemy — server-only (no NEXT_PUBLIC_ prefix = not exposed to browser)
ALCHEMY_API_KEY=your_alchemy_api_key

# Optional: CoinGecko Demo API key (raises rate limit from ~10 to 30 req/min)
# COINGECKO_API_KEY=your_coingecko_demo_key
```

Get your keys:

| Service | Link | Notes |
|---------|------|-------|
| Alchemy | [alchemy.com](https://alchemy.com) | Create app → select **Ethereum Mainnet** → copy API key |
| CoinGecko | [coingecko.com/developers](https://www.coingecko.com/en/developers/dashboard) | Demo key — optional but recommended |

### Run

```bash
pnpm dev      # development server (Turbopack)
pnpm build    # production build
pnpm start    # production server
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ALCHEMY_API_KEY` | Recommended | Gas price, ERC-20 balances, transaction history |
| `COINGECKO_API_KEY` | Optional | Higher rate limit for market data |

> The app runs without `ALCHEMY_API_KEY` but Gas Tracker and Portfolio will show API error states.

---

## Supported Networks

| Chain | Chain ID | RPC |
|-------|----------|-----|
| Ethereum | 1 | Alchemy eth-mainnet |
| Polygon | 137 | Alchemy polygon-mainnet |
| Arbitrum | 42161 | Alchemy arb-mainnet |
| BNB Chain | 56 | Public BSC dataseed |

---

## API Sources

| Feature | Source | API |
|---------|--------|-----|
| Token prices & market data | CoinGecko (free) | `/coins/markets` |
| Price chart history | CoinGecko | `/coins/{id}/market_chart` |
| Global market stats | CoinGecko | `/global` |
| Liquidity pools | DexScreener v2 | `/tokens/v1/{chain}/{addresses}` |
| Token DEX listings | DexScreener v2 | `/tokens/v1/ethereum/{address}` |
| Gas price | Alchemy | `eth_gasPrice` JSON-RPC |
| ERC-20 balances | Alchemy | `alchemy_getTokenBalances` |
| Transaction history | Alchemy | `alchemy_getAssetTransfers` |

---

## Key Design Decisions

**Next.js API Routes as proxy**
CoinGecko and DexScreener block browser CORS requests. Routing through server-side proxy routes solves CORS and keeps API keys off the client.

**API logic in thunks, not lib/api**
Every API call maps directly to a Redux state update for this project. Keeping logic inside thunks removes an unnecessary abstraction and makes data flow linear and easy to trace.

**Custom ResizeObserver instead of Recharts ResponsiveContainer**
`ResponsiveContainer` triggers a render at `width=-1, height=-1` during SSR/hydration causing noisy console warnings. A `ResizeObserver` hook delays chart rendering until the container has real pixel dimensions.

**wagmi hooks instead of RainbowKit**
RainbowKit 2.x has a QR code rendering bug with React 19 / Next.js 16 (`invalid border=0`). Using wagmi hooks directly with a custom `WalletButton` component provides the same UX without the compatibility issue.

**WalletConnect lazy initialization**
`walletConnect()` connector uses `indexedDB` (browser-only API). Pre-registering it in `wagmiConfig` causes a server-side crash. The connector is created on-demand inside the button click handler so it only initializes client-side.
