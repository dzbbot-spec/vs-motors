import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type { Listing, ListingsPage } from '../types'

export function useListings(sort: string = 'date_desc') {
  const [items, setItems] = useState<Listing[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // sortBy передаётся явно чтобы useCallback не пересоздавался при смене sort
  const loadPage = useCallback(async (pageNum: number, sortBy: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<ListingsPage>(
        `/api/listings?page=${pageNum}&page_size=20&sort=${sortBy}`
      )
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

  // Сбрасываем список и загружаем заново при смене сортировки
  useEffect(() => {
    setItems([])
    setInitialLoading(true)
    loadPage(1, sort)
  }, [sort, loadPage])

  const loadMore = useCallback(() => {
    if (!loading && !initialLoading && hasNext) loadPage(page + 1, sort)
  }, [loading, initialLoading, hasNext, page, loadPage, sort])

  return { items, loading, initialLoading, hasNext, error, loadMore }
}
