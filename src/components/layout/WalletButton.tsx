'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { mainnet, polygon, arbitrum, bsc } from 'wagmi/chains'

const WC_PROJECT_ID = '71d2d52ccb0fb123c7af231ee206c308'

const CHAINS = [
  { chain: mainnet, label: 'Ethereum', color: '#627EEA' },
  { chain: polygon, label: 'Polygon', color: '#8247E5' },
  { chain: arbitrum, label: 'Arbitrum', color: '#28A0F0' },
  { chain: bsc, label: 'BNB Chain', color: '#F3BA2F' },
]

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentChain = CHAINS.find((c) => c.chain.id === chainId)

  function handleConnectInjected() {
    setError(null)
    setModalOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('no_wallet')
      return
    }
    connect(
      { connector: injected() },
      {
        onError: (e) => {
          // User cancelled/rejected → not an error, just ignore
          if (e.message?.toLowerCase().includes('reject') || e.message?.toLowerCase().includes('cancel')) return
          setError(e.message)
        },
      }
    )
  }

  function handleConnectWC() {
    setError(null)
    setModalOpen(false)
    connect(
      { connector: walletConnect({ projectId: WC_PROJECT_ID }) },
      {
        onError: (e) => {
          // "Connection request reset" = user closed QR modal without scanning → not a real error
          if (
            e.message?.toLowerCase().includes('reset') ||
            e.message?.toLowerCase().includes('closed') ||
            e.message?.toLowerCase().includes('reject') ||
            e.message?.toLowerCase().includes('cancel')
          ) return
          setError(e.message)
        },
      }
    )
  }

  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-end gap-1">
        <button
          onClick={() => setModalOpen(!modalOpen)}
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Connecting…' : 'Connect Wallet'}
        </button>

        {/* Wallet picker dropdown */}
        {modalOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl z-50 overflow-hidden">
            <p className="px-4 pt-3 pb-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Choose wallet
            </p>
            {/* MetaMask / browser extension */}
            <button
              onClick={handleConnectInjected}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="" className="h-6 w-6" />
              <span>MetaMask</span>
              <span className="ml-auto text-xs text-gray-500">Extension</span>
            </button>
            {/* WalletConnect — QR code for mobile */}
            <button
              onClick={handleConnectWC}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors border-t border-gray-800"
            >
              <svg viewBox="0 0 300 185" className="h-6 w-6 shrink-0" fill="none">
                <path d="M61.44 36.46c48.89-47.88 128.24-47.88 177.13 0l5.88 5.76a6.04 6.04 0 010 8.67l-20.13 19.71a3.18 3.18 0 01-4.43 0l-8.1-7.93c-34.12-33.41-89.44-33.41-123.56 0l-8.68 8.5a3.18 3.18 0 01-4.43 0L55 51.47a6.04 6.04 0 010-8.67l6.44-6.34zM278.3 77.02l17.91 17.54a6.04 6.04 0 010 8.67L202.3 196.04a6.36 6.36 0 01-8.86 0l-66.93-65.53a1.59 1.59 0 00-2.21 0l-66.94 65.53a6.36 6.36 0 01-8.86 0L4.8 103.23a6.04 6.04 0 010-8.67l17.91-17.54a6.36 6.36 0 018.86 0l66.93 65.53a1.59 1.59 0 002.22 0l66.93-65.53a6.36 6.36 0 018.86 0l66.93 65.53a1.59 1.59 0 002.21 0l66.93-65.53a6.36 6.36 0 018.86 0z" fill="#3B99FC"/>
              </svg>
              <span>WalletConnect</span>
              <span className="ml-auto text-xs text-gray-500">QR / Mobile</span>
            </button>
          </div>
        )}

        {error === 'no_wallet' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>
              No wallet found.{' '}
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
                Install MetaMask
              </a>
            </span>
          </div>
        )}
        {error && error !== 'no_wallet' && (
          <p className="text-xs text-red-400 max-w-xs text-right">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Chain switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white hover:border-gray-600 transition-colors"
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentChain?.color ?? '#627EEA' }} />
          {currentChain?.label ?? 'Unknown'}
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-gray-400">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-700 bg-gray-900 shadow-xl z-50">
            {CHAINS.map(({ chain, label, color }) => (
              <button
                key={chain.id}
                onClick={() => { switchChain({ chainId: chain.id }); setDropdownOpen(false) }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-gray-800 ${
                  chain.id === chainId ? 'text-white' : 'text-gray-400'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
                {chain.id === chainId && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-4 w-4 text-indigo-400">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Address + disconnect */}
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white hover:border-red-800 hover:text-red-400 transition-colors group"
        title="Click to disconnect"
      >
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
      </button>
    </div>
  )
}
