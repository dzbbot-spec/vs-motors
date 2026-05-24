import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useTelegram } from '../hooks/useTelegram'
import CarCard from '../components/CarCard'
import CardSkeleton from '../components/CardSkeleton'
import './HomePage.css'

export default function HomePage() {
  const { items, loading, initialLoading, error, loadMore } = useListings()
  const { isOwner, user } = useTelegram()
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Бесконечная прокрутка через IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__logo">VS MOTORS</h1>
        {isOwner && (
          <button className="home__add-btn" onClick={() => navigate('/add')}>
            + Добавить
          </button>
        )}
      </header>

      {/* DEBUG — убрать после диагностики */}
      <div style={{ fontSize: 11, padding: '4px 12px', color: '#888', wordBreak: 'break-all' }}>
        TG user: {user ? `id=${user.id}` : 'null'} | OWNER_ID: {import.meta.env.VITE_OWNER_TG_ID ?? 'undefined'} | isOwner: {String(isOwner)}
      </div>

      {error && <p className="home__error">{error}</p>}

      {initialLoading ? (
        <div className="home__grid">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="home__empty">
          <p>Объявлений пока нет</p>
        </div>
      ) : (
        <div className="home__grid">
          {items.map(listing => (
            <CarCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="home__sentinel" />
      {loading && !initialLoading && (
        <div className="home__grid home__grid--more">
          {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}
    </div>
  )
}
