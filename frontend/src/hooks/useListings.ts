import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type { Listing, ListingsPage } from '../types'

export function useListings() {
  const [items, setItems] = useState<Listing[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<ListingsPage>(`/api/listings?page=${pageNum}&page_size=20`)
      setItems(prev => pageNum === 1 ? data.items : [...prev, ...data.items])
      setHasNext(data.has_next)
      setPage(pageNum)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  const loadMore = useCallback(() => {
    if (!loading && !initialLoading && hasNext) loadPage(page + 1)
  }, [loading, initialLoading, hasNext, page, loadPage])

  return { items, loading, initialLoading, hasNext, error, loadMore }
}
