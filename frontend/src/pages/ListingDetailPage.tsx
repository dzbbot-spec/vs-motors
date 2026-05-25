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

      {/* Кнопки контактов */}
      <div className="detail-contacts">
        <button
          className="detail-contact-btn"
          onClick={() => window.open(`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`)}
        >
          Написать в Telegram
        </button>
        {import.meta.env.VITE_OWNER_WHATSAPP && (
          <button
            className="detail-contact-btn"
            onClick={() => window.open(`https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP}`)}
          >
            Написать в WhatsApp
          </button>
        )}
        {import.meta.env.VITE_OWNER_PHONE && (
          <button
            className="detail-contact-btn"
            onClick={() => window.open(`tel:${import.meta.env.VITE_OWNER_PHONE}`)}
          >
            Позвонить
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

      <BottomNav />
    </div>
  )
}
