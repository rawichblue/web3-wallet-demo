'use client'

import WalletButton from '@/components/layout/WalletButton'

export default function ConnectPrompt() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-700 bg-gray-900">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">Connect your wallet</h2>
        <p className="mt-2 text-sm text-gray-400">
          Connect your wallet to view your portfolio, <br />
          token balances, and transaction history.
        </p>
      </div>
      <WalletButton />
      <p className="text-xs text-gray-600">
        Supports MetaMask and injected wallets
      </p>
    </div>
  )
}
