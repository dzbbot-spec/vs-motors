import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import { useBackButton } from '../hooks/useBackButton'
import { showConfirm } from '../lib/telegram'
import PhotoGallery from '../components/PhotoGallery'
import BottomNav from '../components/BottomNav'
import type { ListingFull } from '../types'

const TRANSMISSION: Record<string, string> = { AUTO: 'Автомат', MANUAL: 'Механика', ROBOT: 'Робот', CVT: 'Вариатор' }
const FUEL: Record<string, string> = { PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ' }
const BODY: Record<string, string> = { SEDAN: 'Седан', SUV: 'Кроссовер/Внедорожник', HATCHBACK: 'Хэтчбек', WAGON: 'Универсал', COUPE: 'Купе', CONVERTIBLE: 'Кабриолет', MINIVAN: 'Минивэн', PICKUP: 'Пикап' }
const DRIVE: Record<string, string> = { FWD: 'Передний', RWD: 'Задний', AWD: 'Полный' }

const OWNER_TG = import.meta.env.VITE_OWNER_TG_USERNAME ?? ''
const OWNER_WA = import.meta.env.VITE_OWNER_WHATSAPP ?? ''
const OWNER_PHONE = import.meta.env.VITE_OWNER_PHONE ?? ''

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { isOwner } = useTelegram()
  useBackButton()

  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descExpanded, setDescExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

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
      <div className="page">
        <div style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }} className="skeleton-box" />
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton-line" style={{ height: 26, width: '70%' }} />
          <div className="skeleton-line" style={{ height: 30, width: '50%' }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="page">
        <div className="error-msg">{error ?? 'Объявление не найдено'}</div>
        <BottomNav />
      </div>
    )
  }

  const price = listing.price.toLocaleString('ru-RU')
  const title = `${listing.brand} ${listing.model} ${listing.year}`

  const handleShare = () => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME
    const url = `https://t.me/${botUsername}?startapp=listing_${listing.id}`
    navigator.clipboard.writeText(url).then(() => {
      alert('Ссылка скопирована!')
    }).catch(() => {
      alert(url)
    })
  }

  const handleDelete = async () => {
    const ok = await showConfirm('Удалить объявление? Это действие нельзя отменить.')
    if (!ok) return
    setDeleting(true)
    try {
      await api.delete(`/api/listings/${id}`)
      nav('/', { replace: true })
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

  const SPECS: Array<{ label: string; value: string | number | null | undefined }> = [
    { label: 'Год', value: listing.year },
    { label: 'Пробег', value: listing.mileage != null ? `${listing.mileage.toLocaleString('ru-RU')} км` : null },
    { label: 'Коробка', value: listing.transmission ? (TRANSMISSION[listing.transmission] ?? listing.transmission) : null },
    { label: 'Топливо', value: listing.fuel_type ? (FUEL[listing.fuel_type] ?? listing.fuel_type) : null },
    { label: 'Кузов', value: listing.body_type ? (BODY[listing.body_type] ?? listing.body_type) : null },
    { label: 'Цвет', value: listing.color },
    { label: 'Объём', value: listing.engine_volume != null ? `${listing.engine_volume} л` : null },
    { label: 'Мощность', value: listing.power_hp != null ? `${listing.power_hp} л.с.` : null },
    { label: 'Привод', value: listing.drive_type ? (DRIVE[listing.drive_type] ?? listing.drive_type) : null },
    { label: 'Страна', value: listing.country },
  ].filter(s => s.value != null)

  const DESC_LIMIT = 300
  const descShort = listing.description && listing.description.length > DESC_LIMIT
    ? listing.description.slice(0, DESC_LIMIT) + '...'
    : listing.description

  return (
    <div className="page">
      <PhotoGallery photos={listing.photos} alt={title} />

      {/* Заголовок и цена */}
      <div style={{ position: 'relative' }}>
        <div className="detail-title" style={{ paddingRight: 52 }}>{title}</div>
        <div className="detail-price">{price} {listing.currency}</div>

        {/* Pill-статус */}
        <div className={`detail-status ${listing.status === 'active' ? 'detail-status--active' : 'detail-status--sold'}`}>
          {listing.status === 'active' ? 'В продаже' : 'Продано'}
        </div>

        {/* Поделиться */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleShare}
          aria-label="Поделиться"
          style={{ position: 'absolute', top: 12, right: 12, width: 'auto' }}
        >
          ↗
        </button>
      </div>

      {/* Контакты */}
      <div className="detail-contacts">
        <a
          href={`https://t.me/${OWNER_TG}`}
          target="_blank"
          rel="noreferrer"
          className="detail-contact-btn"
        >
          Написать в Telegram
        </a>
        {OWNER_WA && (
          <a
            href={`https://wa.me/${OWNER_WA}`}
            target="_blank"
            rel="noreferrer"
            className="detail-contact-btn"
          >
            WhatsApp
          </a>
        )}
        {OWNER_PHONE && (
          <a
            href={`tel:${OWNER_PHONE}`}
            className="detail-contact-btn"
          >
            {OWNER_PHONE}
          </a>
        )}
      </div>

      {/* Характеристики */}
      {SPECS.length > 0 && (
        <>
          <div className="detail-specs-title">Характеристики</div>
          <div className="detail-specs-grid">
            {SPECS.map(s => (
              <div key={s.label} className="detail-spec-block">
                <div className="detail-spec-label">{s.label}</div>
                <div className="detail-spec-value">{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* VIN */}
      {listing.vin && (
        <>
          <div className="detail-specs-title">VIN</div>
          <div style={{ padding: '0 16px 20px', fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.05em' }}>
            {listing.vin}
          </div>
        </>
      )}

      {/* Описание */}
      {listing.description && (
        <div className="desc-section">
          <div className="detail-specs-title" style={{ padding: '0 0 10px' }}>Описание</div>
          <div className="desc-text">
            {descExpanded ? listing.description : descShort}
          </div>
          {listing.description.length > DESC_LIMIT && (
            <button
              className="desc-toggle"
              onClick={() => setDescExpanded(e => !e)}
            >
              {descExpanded ? 'Скрыть' : 'Показать больше'}
            </button>
          )}
        </div>
      )}

      {/* Кнопки владельца */}
      {isOwner && (
        <div className="detail-owner-actions">
          <button
            className="detail-owner-btn"
            onClick={() => nav(`/listing/${id}/edit`)}
          >
            Редактировать
          </button>
          <button
            className="detail-owner-btn"
            onClick={handleToggleStatus}
            disabled={toggling}
          >
            {toggling
              ? <div className="spinner spinner--dark" />
              : listing.status === 'active' ? 'Продано' : 'В продаже'
            }
          </button>
          <button
            className="detail-owner-btn detail-owner-btn--danger"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Удалить"
          >
            {deleting ? <div className="spinner" /> : '×'}
          </button>
        </div>
      )}

      <div style={{ height: 32 }} />
      <BottomNav />
    </div>
  )
}
