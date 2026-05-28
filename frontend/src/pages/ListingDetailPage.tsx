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

  /* Dot-пагинация галереи */
  const trackRef = useRef<HTMLDivElement>(null)
  const [activePhoto, setActivePhoto] = useState(0)
  const handleScroll = () => {
    if (!trackRef.current) return
    const idx = Math.round(trackRef.current.scrollLeft / trackRef.current.offsetWidth)
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
        <div style={{ aspectRatio: '16/9', background: '#e0e0e0' }} />
        <div style={{ padding: 16 }}>
          <div className="skeleton-line" style={{ height: 26, width: '70%', marginBottom: 12 }} />
          <div className="skeleton-line" style={{ height: 32, width: '50%' }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="detail-page">
        <div className="error-msg">{error ?? 'Объявление не найдено'}</div>
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

  return (
    <div className="detail-page">

      {/* Галерея */}
      <div className="detail-gallery">
        {listing.photos.length > 0 ? (
          <>
            <div className="detail-gallery__track" onScroll={handleScroll} ref={trackRef}>
              {listing.photos.map((url, i) => (
                <div key={i} className="detail-gallery__slide">
                  <img src={url} alt="" loading="lazy" />
                </div>
              ))}
            </div>
            {listing.photos.length > 1 && (
              <div className="detail-gallery__dots">
                {listing.photos.map((_, i) => (
                  <div
                    key={i}
                    className={`detail-gallery__dot${i === activePhoto ? ' detail-gallery__dot--active' : ''}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="detail-gallery__no-photo" />
        )}
      </div>

      {/* Заголовок, цена, статус */}
      <div className="detail-card">
        <h1 className="detail-title">{listing.brand} {listing.model} {listing.year}</h1>
        <p className="detail-price">{listing.price.toLocaleString()} {listing.currency}</p>
        <span className={`detail-status detail-status--${listing.status}`}>
          {listing.status === 'active' ? 'В продаже' : 'Продано'}
        </span>
      </div>

      {/* Кнопки контактов — круглые иконки в ряд */}
      <div className="detail-contacts">
        <button className="detail-contact-icon" onClick={() =>
          window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)
        }>
          <div className="detail-contact-icon__circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21.8 2.15L2.4 9.8c-1.3.52-1.29 1.25-.24 1.57l4.9 1.53 11.37-7.18c.54-.33 1.03-.15.63.21L8.8 16.13l-.37 5.1c.54 0 .78-.25 1.08-.53l2.6-2.52 5.1 3.75c.94.52 1.61.25 1.84-.87l3.33-15.69c.34-1.36-.52-1.97-1.58-1.22z" fill="currentColor"/>
            </svg>
          </div>
          <span className="detail-contact-icon__label">Telegram</span>
        </button>

        {import.meta.env.VITE_OWNER_WHATSAPP && (
          <button className="detail-contact-icon" onClick={() =>
            window.open(`https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP}`)
          }>
            <div className="detail-contact-icon__circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.1-1.34A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.07 14.07c-.22.62-1.28 1.18-1.76 1.25-.45.07-1.02.1-1.64-.1-.38-.12-.86-.28-1.48-.55-2.6-1.12-4.3-3.74-4.43-3.91-.13-.17-1.07-1.42-1.07-2.71 0-1.29.68-1.92.92-2.18.24-.26.52-.33.7-.33.17 0 .35 0 .5.01.17.01.39-.06.61.47.22.53.76 1.85.83 1.98.07.13.11.29.02.46-.09.17-.13.28-.26.43-.13.15-.27.34-.39.45-.13.12-.26.25-.11.49.15.24.66 1.09 1.42 1.76.97.87 1.79 1.14 2.04 1.27.25.13.39.11.54-.07.15-.18.62-.72.79-.97.17-.25.33-.21.56-.13.22.08 1.42.67 1.66.79.24.12.4.18.46.28.06.1.06.58-.16 1.2z" fill="currentColor"/>
              </svg>
            </div>
            <span className="detail-contact-icon__label">WhatsApp</span>
          </button>
        )}

        {import.meta.env.VITE_OWNER_PHONE && (
          <button className="detail-contact-icon" onClick={() =>
            window.open(`tel:${import.meta.env.VITE_OWNER_PHONE}`)
          }>
            <div className="detail-contact-icon__circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
              </svg>
            </div>
            <span className="detail-contact-icon__label">Позвонить</span>
          </button>
        )}
      </div>

      {/* Характеристики */}
      <p className="detail-section-title">Характеристики</p>
      <div className="detail-specs-grid">
        {listing.year && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Год</p>
            <p className="detail-spec-value">{listing.year}</p>
          </div>
        )}
        {listing.mileage != null && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Пробег</p>
            <p className="detail-spec-value">{listing.mileage.toLocaleString()} км</p>
          </div>
        )}
        {listing.transmission && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Коробка</p>
            <p className="detail-spec-value">{TRANSMISSION[listing.transmission] ?? listing.transmission}</p>
          </div>
        )}
        {listing.fuel_type && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Топливо</p>
            <p className="detail-spec-value">{FUEL[listing.fuel_type] ?? listing.fuel_type}</p>
          </div>
        )}
        {listing.body_type && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Кузов</p>
            <p className="detail-spec-value">{BODY[listing.body_type] ?? listing.body_type}</p>
          </div>
        )}
        {listing.drive_type && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Привод</p>
            <p className="detail-spec-value">{DRIVE[listing.drive_type] ?? listing.drive_type}</p>
          </div>
        )}
        {listing.engine_volume && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Объём</p>
            <p className="detail-spec-value">{listing.engine_volume} л</p>
          </div>
        )}
        {listing.power_hp && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Мощность</p>
            <p className="detail-spec-value">{listing.power_hp} л.с.</p>
          </div>
        )}
        {listing.color && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Цвет</p>
            <p className="detail-spec-value">{listing.color}</p>
          </div>
        )}
        {listing.country && (
          <div className="detail-spec-block">
            <p className="detail-spec-label">Страна</p>
            <p className="detail-spec-value">{listing.country}</p>
          </div>
        )}
      </div>

      {/* История автомобиля */}
      {(listing.vin || listing.owners_count != null || listing.has_accidents != null) && (
        <>
          <p className="detail-section-title">История автомобиля</p>
          <div className="detail-history">
            {listing.vin && (
              <div className="history-row">
                <span className="history-label">VIN</span>
                <span className="history-value history-value--mono">{listing.vin}</span>
              </div>
            )}
            {listing.owners_count != null && (
              <div className="history-row">
                <span className="history-label">Владельцев</span>
                <span className="history-value">{listing.owners_count === 5 ? '5 и более' : listing.owners_count}</span>
              </div>
            )}
            <div className="history-row">
              <span className="history-label">ДТП</span>
              <span className={`history-badge ${listing.has_accidents ? 'history-badge--warn' : 'history-badge--ok'}`}>
                {listing.has_accidents ? 'Были' : 'Не было'}
              </span>
            </div>
            <div className="history-row">
              <span className="history-label">ПТС</span>
              <span className={`history-badge ${listing.pts_original ? 'history-badge--ok' : 'history-badge--warn'}`}>
                {listing.pts_original ? 'Оригинал' : 'Дубликат'}
              </span>
            </div>
            {listing.service_history && (
              <div className="history-row">
                <span className="history-label">Сервисная книжка</span>
                <span className="history-badge history-badge--ok">Есть</span>
              </div>
            )}
            <div className="history-row">
              <span className="history-label">Таможня</span>
              <span className={`history-badge ${listing.customs_cleared ? 'history-badge--ok' : 'history-badge--warn'}`}>
                {listing.customs_cleared ? 'Растаможен' : 'Не растаможен'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Описание */}
      {listing.description && (
        <>
          <p className="detail-section-title">Описание</p>
          <div className="detail-desc-card">{listing.description}</div>
        </>
      )}

      {/* Кнопки владельца */}
      {isOwner && (
        <div className="detail-owner-actions">
          <button
            className="detail-owner-btn"
            onClick={() => navigate(`/listing/${listing.id}/edit`)}
          >
            Редактировать
          </button>
          <button
            className="detail-owner-btn"
            onClick={handleToggleStatus}
            disabled={toggling}
          >
            {toggling ? '...' : listing.status === 'active' ? 'Продано' : 'В продаже'}
          </button>
          <button
            className="detail-owner-btn detail-owner-btn--danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '...' : 'Удалить'}
          </button>
        </div>
      )}

      <div style={{ height: '80px' }} />
      <BottomNav />
    </div>
  )
}
