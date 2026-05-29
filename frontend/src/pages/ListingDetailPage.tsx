import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import { useBackButton } from '../hooks/useBackButton'
import { showConfirm } from '../lib/telegram'
import BottomNav from '../components/BottomNav'
import type { ListingFull } from '../types'
import './ListingDetailPage.css'

const TRANSMISSION: Record<string, string> = { AUTO: 'Автомат', MANUAL: 'Механика', ROBOT: 'Робот', CVT: 'Вариатор' }
const FUEL: Record<string, string> = { PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ' }
const BODY: Record<string, string> = { SEDAN: 'Седан', SUV: 'Кроссовер/Внедорожник', HATCHBACK: 'Хэтчбек', WAGON: 'Универсал', COUPE: 'Купе', CONVERTIBLE: 'Кабриолет', MINIVAN: 'Минивэн', PICKUP: 'Пикап' }
const DRIVE: Record<string, string> = { FWD: 'Передний', RWD: 'Задний', AWD: 'Полный' }

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOwner } = useTelegram()
  useBackButton()

  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  /* Dot-пагинация галереи */
  const heroRef = useRef<HTMLDivElement>(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const handleScroll = () => {
    if (!heroRef.current) return
    const idx = Math.round(heroRef.current.scrollLeft / heroRef.current.offsetWidth)
    setActivePhoto(idx)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get<ListingFull>(`/api/listings/${id}`)
      .then(setListing)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="detail-page">
        <div className="d-hero">
          <button className="d-back" onClick={() => navigate(-1)} aria-label="Назад">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
        </div>
        <div className="detail-sheet">
          <div className="detail-grab" />
          <div className="skeleton-line" style={{ height: 30, width: '70%', marginBottom: 12 }} />
          <div className="skeleton-line" style={{ height: 40, width: '50%' }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="detail-page">
        <div className="d-hero">
          <button className="d-back" onClick={() => navigate(-1)} aria-label="Назад">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
        </div>
        <div className="detail-sheet">
          <div className="detail-grab" />
          <div className="error-msg">{error ?? 'Объявление не найдено'}</div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const handleDelete = async () => {
    const ok = await showConfirm('Удалить объявление? Это действие нельзя отменить.')
    if (!ok) return
    setDeleting(true)
    try {
      await api.delete(`/api/listings/${id}`)
      navigate('/', { replace: true })
    } catch (e: unknown) {
      setDeleting(false)
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    }
  }

  const handleShare = () => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME
    const url = `https://t.me/${botUsername}?startapp=listing_${listing?.id}`
    if (navigator.share) {
      navigator.share({
        title: `${listing?.brand} ${listing?.model} ${listing?.year}`,
        text: `${listing?.price.toLocaleString()} ${listing?.currency}`,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }).catch(() => { window.open(url) })
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = listing.status === 'active' ? 'sold' : 'active'
    const label = newStatus === 'sold' ? 'Отметить как "Продано"?' : 'Вернуть в продажу?'
    const ok = await showConfirm(label)
    if (!ok) return
    setToggling(true)
    try {
      const updated = await api.patch<ListingFull>(`/api/listings/${id}`, { status: newStatus })
      setListing(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setToggling(false)
    }
  }

  const photos = listing.photos
  const isActive = listing.status === 'active'

  return (
    <div className="detail-page">

      {/* Герой — фото (горизонтальная галерея) */}
      <div className="d-hero">
        <div
          ref={heroRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
        >
          {photos.length > 0
            ? photos.map((url, i) => (
                <div key={i} style={{ flexShrink: 0, width: '100%', height: '100%', scrollSnapAlign: 'start' }}>
                  <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))
            : <div style={{ width: '100%', height: '100%' }} />
          }
        </div>

        {/* Кнопка назад */}
        <button className="d-back" onClick={() => navigate(-1)} aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Кнопка поделиться */}
        <button className="d-share" onClick={handleShare} aria-label="Поделиться">
          {shareCopied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          )}
        </button>

        {/* Точки пагинации */}
        {photos.length > 1 && (
          <div className="d-dots">
            {photos.map((_, i) => (
              <div key={i} className={`d-dot${i === activePhoto ? ' d-dot--active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      <div className="detail-sheet">
        <div className="detail-grab" />

        {/* Главная карточка */}
        <div className="detail-head-card">
          <div className="top">
            <div>
              <div className="title">{listing.brand} {listing.model}</div>
              {listing.year && <div className="year-sub">{listing.year} год</div>}
            </div>
            <div className={`detail-status-badge${isActive ? '' : ' detail-status-badge--sold'}`}>
              <i></i>
              {isActive ? 'В продаже' : 'Продано'}
            </div>
          </div>

          <div className="detail-price">
            {listing.price.toLocaleString('ru-RU')}
            <small>{listing.currency || 'RUB'}</small>
            {isActive && <span className="acc" />}
          </div>

          {(listing.views ?? 0) > 0 && (
            <div className="detail-views">{listing.views} просмотров</div>
          )}

          {/* Кнопки контактов */}
          <div className="detail-contacts">
            <a
              className="c-tg"
              onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6 13.4l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 2.6c.9-.3 1.6.2 1.3 1.7z"/>
              </svg>
              Telegram
            </a>
            {import.meta.env.VITE_OWNER_WHATSAPP && (
              <a
                className="c-wa"
                onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP}`)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {import.meta.env.VITE_OWNER_PHONE && (
              <a
                className="c-call"
                onClick={() => window.open(`tel:${import.meta.env.VITE_OWNER_PHONE}`)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6z"/>
                </svg>
                Позвонить
              </a>
            )}
          </div>
        </div>

        {/* Характеристики */}
        <div className="sec-label">Характеристики</div>
        <div className="spec-grid">
          {listing.year && (
            <div className="spec-block"><div className="k">Год</div><div className="v">{listing.year}</div></div>
          )}
          {listing.mileage != null && (
            <div className="spec-block"><div className="k">Пробег</div><div className="v">{listing.mileage.toLocaleString('ru-RU')} км</div></div>
          )}
          {listing.transmission && (
            <div className="spec-block"><div className="k">Коробка</div><div className="v">{TRANSMISSION[listing.transmission] ?? listing.transmission}</div></div>
          )}
          {listing.fuel_type && (
            <div className="spec-block"><div className="k">Топливо</div><div className="v">{FUEL[listing.fuel_type] ?? listing.fuel_type}</div></div>
          )}
          {listing.body_type && (
            <div className="spec-block"><div className="k">Кузов</div><div className="v">{BODY[listing.body_type] ?? listing.body_type}</div></div>
          )}
          {listing.drive_type && (
            <div className="spec-block"><div className="k">Привод</div><div className="v">{DRIVE[listing.drive_type] ?? listing.drive_type}</div></div>
          )}
          {listing.engine_volume && (
            <div className="spec-block"><div className="k">Объём</div><div className="v">{listing.engine_volume} л</div></div>
          )}
          {listing.power_hp && (
            <div className="spec-block"><div className="k">Мощность</div><div className="v">{listing.power_hp} л.с.</div></div>
          )}
          {listing.color && (
            <div className="spec-block"><div className="k">Цвет</div><div className="v">{listing.color}</div></div>
          )}
          {listing.country && (
            <div className="spec-block"><div className="k">Страна</div><div className="v">{listing.country}</div></div>
          )}
        </div>

        {/* История автомобиля */}
        {(listing.vin || listing.owners_count != null || listing.has_accidents != null) && (
          <>
            <div className="sec-label">История</div>
            <div className="history-card">
              {listing.vin && (
                <div className="history-row">
                  <div className="l"><div className="ic">VIN</div>VIN-номер</div>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{listing.vin}</span>
                </div>
              )}
              {listing.owners_count != null && (
                <div className="history-row">
                  <div className="l"><div className="ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>Владельцев</div>
                  <div className="hpill">{listing.owners_count === 5 ? '5+' : listing.owners_count}</div>
                </div>
              )}
              {listing.has_accidents != null && (
                <div className="history-row">
                  <div className="l"><div className="ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>ДТП</div>
                  <div className={`hpill${listing.has_accidents ? ' hpill--warn' : ''}`}>
                    {listing.has_accidents ? 'Были' : 'Не было'}
                  </div>
                </div>
              )}
              {listing.pts_original != null && (
                <div className="history-row">
                  <div className="l"><div className="ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>ПТС</div>
                  <div className={`hpill${listing.pts_original ? '' : ' hpill--warn'}`}>
                    {listing.pts_original ? 'Оригинал' : 'Дубликат'}
                  </div>
                </div>
              )}
              {listing.service_history && (
                <div className="history-row">
                  <div className="l"><div className="ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>Сервисная книжка</div>
                  <div className="hpill">Есть</div>
                </div>
              )}
              {listing.customs_cleared != null && (
                <div className="history-row">
                  <div className="l"><div className="ic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>Таможня</div>
                  <div className={`hpill${listing.customs_cleared ? '' : ' hpill--warn'}`}>
                    {listing.customs_cleared ? 'Растаможен' : 'Не растаможен'}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Описание */}
        {listing.description && (
          <>
            <div className="sec-label">Описание</div>
            <div className="desc-card">{listing.description}</div>
          </>
        )}

        {/* Кнопки владельца */}
        {isOwner && (
          <>
            <div className="sec-label">Управление</div>
            <div className="owner-actions">
              <button className="owner-btn" onClick={() => navigate(`/listing/${listing.id}/edit`)}>
                Редактировать
              </button>
              <button className="owner-btn" onClick={handleToggleStatus} disabled={toggling}>
                {toggling ? '...' : listing.status === 'active' ? 'Продано' : 'В продаже'}
              </button>
              <button className="owner-btn owner-btn--danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '...' : 'Удалить'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Buy bar — только для покупателей */}
      {!isOwner && (
        <div className="buy-bar">
          <div className="p">
            <span>Цена</span>
            <b>{listing.price.toLocaleString('ru-RU')} {listing.currency || 'RUB'}</b>
          </div>
          <button
            className="btn-apply"
            onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
          >
            Оставить заявку
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
