'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/store-redux/store'
import { marketSelector, fetchTokensService } from '@/store-redux/slices/market'
import type { Token } from '@/types/market'
import SearchBar from '@/components/tokens/SearchBar'
import TokenTable from '@/components/tokens/TokenTable'

export default function TokensPage() {
  const dispatch = useAppDispatch()
  const { tokens, loading } = useSelector(marketSelector)
  const [query, setQuery] = useState('')

  useEffect(() => {
    dispatch(fetchTokensService())
  }, [dispatch])

  const filtered: Token[] = query.trim()
    ? tokens.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : tokens

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Token Explorer</h1>
        <p className="mt-1 text-sm text-gray-400">
          {tokens.length > 0 ? `${tokens.length} tokens` : 'Loading...'}
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by name or symbol..."
      />

      <TokenTable tokens={filtered} loading={loading} />
    </div>
  )
}
