import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useTelegram } from '../hooks/useTelegram'
import CarCard from '../components/CarCard'
import CardSkeleton from '../components/CardSkeleton'
import BottomNav from '../components/BottomNav'

const OWNER_TG = import.meta.env.VITE_OWNER_TG_USERNAME ?? ''

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

  const openContact = () => {
    window.open(`https://t.me/${OWNER_TG}`, '_blank')
  }

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero__title">VS MOTORS</div>
        <div className="hero__sub">АВТОМОБИЛИ ПРЕМИУМ КЛАССА</div>
        <button className="hero__contact" onClick={openContact}>
          ✉ Написать
        </button>
      </div>

      {/* Listings */}
      {error && <div className="error-msg">{error}</div>}

      {initialLoading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🚗</div>
          <div className="empty-state__text">Объявлений пока нет</div>
        </div>
      ) : (
        <>
          {items.map(item => (
            <CarCard key={item.id} item={item} />
          ))}
          {loading && <CardSkeleton />}
          <div ref={sentinelRef} className="load-more-trigger" />
        </>
      )}

      {/* FAB — owner only */}
      {isOwner && (
        <button className="fab" onClick={() => nav('/add')} aria-label="Добавить объявление">
          +
        </button>
      )}

      <BottomNav />
    </div>
  )
}
