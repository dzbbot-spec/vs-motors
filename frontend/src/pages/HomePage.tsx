import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useTelegram } from '../hooks/useTelegram'
import CarCard from '../components/CarCard'
import CardSkeleton from '../components/CardSkeleton'
import BottomNav from '../components/BottomNav'

export default function HomePage() {
  const { items, loading, initialLoading, hasNext, error, loadMore } = useListings()
  const { isOwner } = useTelegram()
  const nav = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNext && !loading) {
        loadMore()
      }
    },
    [hasNext, loading, loadMore]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [handleObserver])

  return (
    <div className="page">
      <div className="home-header">
        <div className="home-header__title">VS MOTORS</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {initialLoading ? (
        <div className="card-list">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__text">Объявлений пока нет</div>
        </div>
      ) : (
        <div className="card-list">
          {items.map(item => (
            <CarCard key={item.id} item={item} />
          ))}
          {loading && <CardSkeleton />}
          <div ref={sentinelRef} className="load-more-trigger" />
        </div>
      )}

      {isOwner && (
        <button className="fab" onClick={() => nav('/add')} aria-label="Добавить объявление">
          +
        </button>
      )}

      <BottomNav />
    </div>
  )
}
