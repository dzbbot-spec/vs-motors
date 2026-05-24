import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useTelegram } from '../hooks/useTelegram'
import CarCard from '../components/CarCard'
import CardSkeleton from '../components/CardSkeleton'
import './HomePage.css'

export default function HomePage() {
  const { items, loading, initialLoading, error, loadMore } = useListings()
  const { isOwner } = useTelegram()
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
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

      {error && <p className="home__error">{error}</p>}

      {initialLoading ? (
        <div className="home__grid">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="home__empty"><p>Объявлений пока нет</p></div>
      ) : (
        <div className="home__grid">
          {items.map(l => <CarCard key={l.id} listing={l} />)}
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
