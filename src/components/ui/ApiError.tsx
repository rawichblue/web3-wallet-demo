interface ApiErrorProps {
  message: string
  onRetry?: () => void
  compact?: boolean
}

export default function ApiError({ message, onRetry, compact = false }: ApiErrorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="truncate">API error: {message}</span>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto shrink-0 underline hover:text-red-300">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-900/50 bg-red-950/20 py-12 text-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <div>
        <p className="text-sm font-medium text-red-400">Failed to load data</p>
        <p className="mt-1 text-xs text-red-500/70">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg border border-red-800 px-4 py-1.5 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
