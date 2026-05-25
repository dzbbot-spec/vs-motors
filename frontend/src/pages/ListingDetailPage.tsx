import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import { useBackButton } from '../hooks/useBackButton'
import { showConfirm } from '../lib/telegram'
import PhotoGallery from '../components/PhotoGallery'
import BottomNav from '../components/BottomNav'
import type { ListingFull } from '../types'

const TRANSMISSION: Record<string, string> = { AUTO:'Автомат', MANUAL:'Механика', ROBOT:'Робот', CVT:'Вариатор' }
const FUEL: Record<string, string> = { PETROL:'Бензин', DIESEL:'Дизель', HYBRID:'Гибрид', ELECTRIC:'Электро', GAS:'Газ' }
const BODY: Record<string, string> = { SEDAN:'Седан', SUV:'Кроссовер/Внедорожник', HATCHBACK:'Хэтчбек', WAGON:'Универсал', COUPE:'Купе', CONVERTIBLE:'Кабриолет', MINIVAN:'Минивэн', PICKUP:'Пикап' }
const DRIVE: Record<string, string> = { FWD:'Передний', RWD:'Задний', AWD:'Полный' }

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
        <div style={{ height: 280, background: 'var(--bg-3)' }} className="skeleton-box" />
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
      alert(e instanceof Error ? e.message : 'Ошибка удаления')
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
      alert(e instanceof Error ? e.message : 'Ошибка')
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

      {/* Header */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div className="detail-title">{title}</div>
            <div className="detail-price">{price} {listing.currency}</div>
          </div>
          <button className="share-btn" onClick={handleShare} aria-label="Поделиться">
            ↗
          </button>
        </div>
        <div className="detail-meta">
          {listing.status === 'sold' && (
            <span className="status-badge status-badge--sold">Продано</span>
          )}
          {listing.status === 'active' && (
            <span className="status-badge status-badge--active">В продаже</span>
          )}
          {listing.mileage != null && (
            <span className="chip">{listing.mileage.toLocaleString('ru-RU')} км</span>
          )}
          {listing.fuel_type && <span className="chip">{FUEL[listing.fuel_type] ?? listing.fuel_type}</span>}
          {listing.body_type && <span className="chip">{BODY[listing.body_type] ?? listing.body_type}</span>}
        </div>
      </div>

      {/* Contact buttons */}
      <div className="contact-actions">
        <a
          href={`https://t.me/${OWNER_TG}`}
          target="_blank"
          rel="noreferrer"
          className="contact-btn contact-btn--tg"
        >
          <span style={{ fontSize: 20 }}>✈</span>
          Написать в Telegram
        </a>
        {OWNER_WA && (
          <a
            href={`https://wa.me/${OWNER_WA}`}
            target="_blank"
            rel="noreferrer"
            className="contact-btn contact-btn--wa"
          >
            <span style={{ fontSize: 20 }}>💬</span>
            WhatsApp
          </a>
        )}
        {OWNER_PHONE && (
          <a
            href={`tel:${OWNER_PHONE}`}
            className="contact-btn contact-btn--phone"
          >
            <span style={{ fontSize: 20 }}>📞</span>
            {OWNER_PHONE}
          </a>
        )}
      </div>

      {/* Specs */}
      {SPECS.length > 0 && (
        <div className="specs-section">
          <div className="specs-title">Характеристики</div>
          <div className="specs-grid">
            {SPECS.map(s => (
              <div key={s.label} className="spec-item">
                <div className="spec-item__label">{s.label}</div>
                <div className="spec-item__value">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIN */}
      {listing.vin && (
        <div className="specs-section" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="specs-title">VIN</div>
          <div style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.05em' }}>
            {listing.vin}
          </div>
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <div className="desc-section">
          <div className="specs-title">Описание</div>
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

      {/* Owner actions */}
      {isOwner && (
        <div className="owner-actions">
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => nav(`/listing/${id}/edit`)}
          >
            ✏ Редактировать
          </button>
          <button
            className="btn btn-outline"
            onClick={handleToggleStatus}
            disabled={toggling}
            style={{ flex: 1 }}
          >
            {toggling
              ? <div className="spinner spinner--dark" />
              : listing.status === 'active' ? 'Продано' : 'В продаже'
            }
          </button>
          <button
            className="btn btn-danger icon-btn"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Удалить"
            style={{ minWidth: 44 }}
          >
            {deleting ? <div className="spinner" /> : '🗑'}
          </button>
        </div>
      )}

      <div style={{ height: 32 }} />
      <BottomNav />
    </div>
  )
}
