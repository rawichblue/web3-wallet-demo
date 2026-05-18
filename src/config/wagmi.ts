import { createConfig, http } from 'wagmi'
import {
  mainnet,   // Ethereum      #1  confirmed in Alchemy dashboard
  bsc,       // BNB Chain     #2  confirmed in Alchemy dashboard
  polygon,   // Polygon       #3  confirmed in Alchemy dashboard
  arbitrum,  // Arbitrum One  #4  confirmed in Alchemy dashboard
  base,      // Base          #5  confirmed in Alchemy dashboard
  avalanche, // Avalanche     #6  confirmed in Alchemy dashboard
  zksync,    // zkSync Era    #7  confirmed in Alchemy dashboard
} from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// walletConnect is NOT pre-registered here because it uses indexedDB
// which doesn't exist on the server (SSR). It's created on-the-fly
// in WalletButton only when the user clicks — browser-only.

export const wagmiConfig = createConfig({
  chains: [mainnet, bsc, polygon, arbitrum, base, avalanche, zksync],
  connectors: [injected(), metaMask()],
  transports: {
    [mainnet.id]:   http(),
    [bsc.id]:       http(),
    [polygon.id]:   http(),
    [arbitrum.id]:  http(),
    [base.id]:      http(),
    [avalanche.id]: http(),
    [zksync.id]:    http(),
  },
  ssr: true,
})
