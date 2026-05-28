import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useTelegram } from '../hooks/useTelegram'
import CarCard from '../components/CarCard'
import CardSkeleton from '../components/CardSkeleton'
import BottomNav from '../components/BottomNav'

const LAYOUT_KEY = 'vs_layout'

const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Сначала новые' },
  { key: 'date_asc', label: 'Сначала старые' },
  { key: 'price_asc', label: 'Дешевле' },
  { key: 'price_desc', label: 'Дороже' },
  { key: 'mileage_asc', label: 'Меньше пробег' },
]

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="13" width="14" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor"/>
    </svg>
  )
}

function IconSort() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4h14M4 9h10M6 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export default function HomePage() {
  const [sort, setSort] = useState('date_desc')
  const [showSort, setShowSort] = useState(false)
  const { items, loading, initialLoading, hasNext, error, loadMore } = useListings(sort)
  const { isOwner } = useTelegram()
  const nav = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY)
    return saved === 'grid' ? 'grid' : 'list'
  })

  const toggleLayout = (value: 'list' | 'grid') => {
    setLayout(value)
    localStorage.setItem(LAYOUT_KEY, value)
  }

  const cardLayout = layout === 'grid' ? 'vertical' : 'horizontal'
  const containerClass = layout === 'grid' ? 'home-content--grid' : 'home-content--list'

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

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sort)?.label ?? 'Сортировка'

  return (
    <div className="page">
      <div className="home-header">
        <div className="home-header__title">VS MOTORS</div>
        <div className="home-header__right">
          <button
            className={`layout-btn${sort !== 'date_desc' ? ' active' : ''}`}
            onClick={() => setShowSort(true)}
            aria-label="Сортировка"
          >
            <IconSort />
          </button>
          <button
            className="layout-btn active"
            onClick={() => toggleLayout(layout === 'list' ? 'grid' : 'list')}
            aria-label={layout === 'list' ? 'Переключить в плитку' : 'Переключить в список'}
          >
            {layout === 'list' ? <IconGrid /> : <IconList />}
          </button>
        </div>
      </div>

      {/* Кнопка связи — под шапкой, до списка */}
      <div className="home-contact-bar">
        <button
          className="btn-contact"
          onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
        >
          Связаться с нами
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {initialLoading ? (
        <div className={containerClass}>
          <CardSkeleton layout={cardLayout} />
          <CardSkeleton layout={cardLayout} />
          <CardSkeleton layout={cardLayout} />
          {layout === 'grid' && <CardSkeleton layout={cardLayout} />}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__text">Объявлений пока нет</div>
        </div>
      ) : (
        <>
          <div className={containerClass}>
            {items.map(item => (
              <CarCard key={item.id} item={item} layout={cardLayout} />
            ))}
            {loading && <CardSkeleton layout={cardLayout} />}
          </div>
          <div ref={sentinelRef} className="load-more-trigger" />
        </>
      )}

      {isOwner && (
        <button className="fab" onClick={() => nav('/add')} aria-label="Добавить объявление">
          +
        </button>
      )}

      {/* Сортировка — bottom sheet */}
      {showSort && (
        <>
          <div className="sort-backdrop" onClick={() => setShowSort(false)} />
          <div className="sort-sheet">
            <div className="sort-handle" />
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`sort-option${sort === opt.key ? ' sort-option--active' : ''}`}
                onClick={() => { setSort(opt.key); setShowSort(false) }}
              >
                <span>{opt.label}</span>
                {sort === opt.key && <span className="sort-check">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  )
}
