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

const CHIPS = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'В продаже' },
  { key: 'sold', label: 'Продано' },
]

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

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="13" width="14" height="2" rx="1" fill="currentColor"/>
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

function IconPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

export default function HomePage() {
  const [sort, setSort] = useState('date_desc')
  const [showSort, setShowSort] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('all')
  const { items, loading, initialLoading, hasNext, error, loadMore } = useListings(sort)
  const { isOwner } = useTelegram()
  const nav = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY)
    return saved === 'grid' ? 'grid' : 'list'
  })

  const toggleLayout = () => {
    const next = layout === 'list' ? 'grid' : 'list'
    setLayout(next)
    localStorage.setItem(LAYOUT_KEY, next)
  }

  const cardLayout = layout === 'grid' ? 'vertical' : 'horizontal'
  const listClass = `home-list${layout === 'grid' ? ' home-list--grid' : ''}`

  /* Фильтрация по статусу (клиентская) */
  const filtered = statusFilter === 'all'
    ? items
    : items.filter(i => i.status === statusFilter)

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

      {/* Шапка */}
      <div className="cat-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="brand-mark">VS</div>
          <div>
            <div className="brand-name">VS MOTORS</div>
            <div className="brand-sub">Премиальные автомобили · в наличии</div>
          </div>
        </div>
        <button
          className="layout-btn"
          onClick={toggleLayout}
          aria-label={layout === 'list' ? 'Переключить в плитку' : 'Переключить в список'}
        >
          {layout === 'list' ? <IconGrid /> : <IconList />}
        </button>
      </div>

      {/* Кнопка "Связаться" + сортировка */}
      <div className="cta-row">
        <button
          className="btn-contact-primary"
          onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6 13.4l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 2.6c.9-.3 1.6.2 1.3 1.7z"/>
          </svg>
          Связаться с нами
        </button>
        <button
          className={`btn-sort-accent${sort !== 'date_desc' ? ' active' : ''}`}
          onClick={() => setShowSort(true)}
          aria-label="Сортировка"
        >
          <IconSort />
        </button>
      </div>

      {/* Статистика */}
      <div className="stats-row">
        <div className="stat-block">
          <b>{items.length}</b>
          <span>в наличии</span>
        </div>
        <div className="stat-block">
          <b>0%</b>
          <span>предоплата</span>
        </div>
        <div className="stat-block">
          <b>24/7</b>
          <span>на связи</span>
        </div>
      </div>

      {/* Чипы-фильтры */}
      <div className="chips-row">
        {CHIPS.map(chip => (
          <button
            key={chip.key}
            className={`chip-filter${statusFilter === chip.key ? ' active' : ''}`}
            onClick={() => setStatusFilter(chip.key as 'all' | 'active' | 'sold')}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {initialLoading ? (
        <div className={listClass}>
          <CardSkeleton layout={cardLayout} />
          <CardSkeleton layout={cardLayout} />
          <CardSkeleton layout={cardLayout} />
          {layout === 'grid' && <CardSkeleton layout={cardLayout} />}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__text">Объявлений пока нет</div>
        </div>
      ) : (
        <>
          <div className={listClass}>
            {filtered.map(item => (
              <CarCard key={item.id} item={item} layout={cardLayout} />
            ))}
            {loading && <CardSkeleton layout={cardLayout} />}
          </div>
          <div ref={sentinelRef} className="load-more-trigger" />
        </>
      )}

      {/* FAB — добавить объявление (только для владельца) */}
      {isOwner && (
        <button className="fab" onClick={() => nav('/add')} aria-label="Добавить объявление">
          <IconPlus />
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
