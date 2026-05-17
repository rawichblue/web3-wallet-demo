import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'coin-images.coingecko.com' },
    ],
  },
  turbopack: {},
  webpack: (config) => {
    // Required for wagmi v2 + WalletConnect when building without Turbopack
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
};

export default nextConfig;
