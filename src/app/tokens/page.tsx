'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchTokensService } from '@/store-redux/slices/market'
import type { Token } from '@/types/market'
import SearchBar from '@/components/tokens/SearchBar'
import TokenTable from '@/components/tokens/TokenTable'
import ApiError from '@/components/ui/ApiError'

const PER_PAGE_OPTIONS = [10, 20, 50] as const
type PerPage = (typeof PER_PAGE_OPTIONS)[number]

/** Build the list of page-number buttons to show around `current`. */
function buildPageWindows(current: number, hasNext: boolean): (number | '...')[] {
  const pages: (number | '...')[] = []

  // Always show page 1
  pages.push(1)

  const lo = Math.max(2, current - 2)
  const hi = hasNext ? current + 2 : current   // don't advertise pages we can't reach

  if (lo > 2) pages.push('...')

  for (let p = lo; p <= hi; p++) pages.push(p)

  return pages
}

export default function TokensPage() {
  const dispatch = useAppDispatch()
  const { tokens, loading, error } = useSelector(marketSelector)

  const [query,   setQuery]   = useState('')
  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState<PerPage>(20)

  useEffect(() => {
    dispatch(fetchTokensService({ page, perPage }))
  }, [dispatch, page, perPage])

  const handleSearch  = (v: string) => setQuery(v)
  const handlePerPage = (v: PerPage) => { setPerPage(v); setPage(1) }

  const filtered: Token[] = query.trim()
    ? tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.symbol.toLowerCase().includes(query.toLowerCase()),
      )
    : tokens

  const hasNextPage = !query && tokens.length === perPage
  const hasPrevPage = page > 1

  const pageWindows = buildPageWindows(page, hasNextPage)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Token Explorer</h1>
        <p className="mt-1 text-sm text-gray-400">
          {loading ? 'Loading…' : `${filtered.length} tokens · Page ${page}`}
        </p>
      </div>

      <SearchBar value={query} onChange={handleSearch} placeholder="Search by name or symbol..." />

      {error
        ? <ApiError message={error} onRetry={() => dispatch(fetchTokensService({ page, perPage }))} />
        : <TokenTable tokens={filtered} loading={loading} />
      }

      {/* ── Pagination bar ── */}
      {!query && !error && (
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Left: Previous + page numbers + Next */}
          <div className="flex items-center gap-1.5">

            {/* Previous */}
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevPage || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
              Previous
            </button>

            {/* Page number pills */}
            {pageWindows.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-600">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={`min-w-[36px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    p === page
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          </div>

          {/* Right: Show N per page */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show</span>
            {PER_PAGE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handlePerPage(n)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  perPage === n
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
