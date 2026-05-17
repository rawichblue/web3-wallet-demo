import type { Transaction } from '@/types/portfolio'
import { formatAddress, formatTimestamp, formatTokenAmount } from '@/lib/utils/format'

const TX_ICONS: Record<Transaction['type'], { label: string; color: string }> = {
  send: { label: 'Send', color: 'text-red-400 bg-red-400/10' },
  receive: { label: 'Receive', color: 'text-green-400 bg-green-400/10' },
  swap: { label: 'Swap', color: 'text-blue-400 bg-blue-400/10' },
  approve: { label: 'Approve', color: 'text-yellow-400 bg-yellow-400/10' },
}

interface TxHistoryProps {
  transactions: Transaction[]
  loading?: boolean
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-9 w-16 rounded-lg bg-gray-800" />
      <div className="flex-1">
        <div className="h-4 w-32 rounded bg-gray-800" />
        <div className="mt-1 h-3 w-24 rounded bg-gray-800" />
      </div>
      <div className="h-4 w-20 rounded bg-gray-800" />
    </div>
  )
}

export default function TxHistory({ transactions, loading }: TxHistoryProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="border-b border-gray-800 px-5 py-4">
        <h3 className="text-sm font-medium text-white">Transaction History</h3>
      </div>

      <div className="divide-y divide-gray-800">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : transactions.map((tx) => {
              const meta = TX_ICONS[tx.type] ?? TX_ICONS.send
              return (
                <div key={tx.hash} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-800/30 transition-colors">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-white truncate">
                      {formatAddress(tx.hash)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.type === 'receive' ? `From ${formatAddress(tx.from)}` : `To ${formatAddress(tx.to)}`}
                      {' · '}
                      {formatTimestamp(tx.timestamp)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-white">
                      {formatTokenAmount(tx.valueFormatted, 4)} {tx.tokenSymbol}
                    </p>
                    <span className={`text-xs ${tx.status === 'success' ? 'text-green-500' : tx.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              )
            })}
      </div>

      {!loading && transactions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  )
}
