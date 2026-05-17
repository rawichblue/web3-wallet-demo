import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, bsc } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// walletConnect is NOT pre-registered here because it uses indexedDB
// which doesn't exist on the server (SSR). It's created on-the-fly
// in WalletButton only when the user clicks — browser-only.

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, bsc],
  connectors: [injected(), metaMask()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
})
