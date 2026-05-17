import { getChangeBg } from '@/lib/utils/format'

interface StatCardProps {
  label: string
  value: string
  change?: number
  subValue?: string
  loading?: boolean
}

export default function StatCard({ label, value, change, subValue, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 animate-pulse">
        <div className="h-4 w-24 rounded bg-gray-700" />
        <div className="mt-3 h-7 w-32 rounded bg-gray-700" />
        <div className="mt-2 h-4 w-20 rounded bg-gray-700" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 transition-colors">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {change !== undefined && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getChangeBg(change)}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
      </div>
    </div>
  )
}
