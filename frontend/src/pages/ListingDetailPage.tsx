import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import { useBackButton } from '../hooks/useBackButton'
import { ListingFull } from '../types'
import PhotoGallery from '../components/PhotoGallery'
import './ListingDetailPage.css'

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTO: 'Автомат', MANUAL: 'Механика', CVT: 'Вариатор', ROBOT: 'Робот',
}
const FUEL_LABELS: Record<string, string> = {
  PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ',
}
const BODY_LABELS: Record<string, string> = {
  SEDAN: 'Седан', HATCHBACK: 'Хэтчбек', SUV: 'Внедорожник', MINIVAN: 'Минивэн',
  COUPE: 'Купе', WAGON: 'Универсал', CONVERTIBLE: 'Кабриолет', PICKUP: 'Пикап',
}
const DRIVE_LABELS: Record<string, string> = {
  FWD: 'Передний', RWD: 'Задний', AWD: 'Полный',
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOwner } = useTelegram()
  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(false)
  const [deleting, setDeleting] = useState(false)
  useBackButton()

  useEffect(() => {
    api.get<ListingFull>(`/api/listings/${id}`)
      .then(setListing)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleShare = () => {
    const url = `https://t.me/${import.meta.env.VITE_BOT_USERNAME}?startapp=listing_${id}`
    navigator.clipboard.writeText(url)
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const handleDelete = async () => {
    if (!window.confirm('Удалить объявление?')) return
    setDeleting(true)
    await api.delete(`/api/listings/${id}`)
    navigate('/')
  }

  if (loading) return <div className="detail__loading">Загрузка...</div>
  if (!listing) return null

  const sold = listing.status === 'sold'
  const ownerTg = import.meta.env.VITE_OWNER_TG_USERNAME
  const ownerWa = import.meta.env.VITE_OWNER_WHATSAPP
  const ownerPhone = import.meta.env.VITE_OWNER_PHONE

  const specs: [string, string | null | undefined][] = [
    ['Пробег', listing.mileage != null ? `${listing.mileage.toLocaleString()} км` : null],
    ['Год выпуска', String(listing.year)],
    ['КПП', listing.transmission ? (TRANSMISSION_LABELS[listing.transmission] ?? listing.transmission) : null],
    ['Топливо', listing.fuel_type ? (FUEL_LABELS[listing.fuel_type] ?? listing.fuel_type) : null],
    ['Кузов', listing.body_type ? (BODY_LABELS[listing.body_type] ?? listing.body_type) : null],
    ['Цвет', listing.color],
    ['Объём двигателя', listing.engine_volume != null ? `${listing.engine_volume} л` : null],
    ['Мощность', listing.power_hp != null ? `${listing.power_hp} л.с.` : null],
    ['Привод', listing.drive_type ? (DRIVE_LABELS[listing.drive_type] ?? listing.drive_type) : null],
    ['VIN', listing.vin],
    ['Страна сборки', listing.country],
  ]

  return (
    <div className="detail">
      <PhotoGallery photos={listing.photos} alt={`${listing.brand} ${listing.model}`} />

      <div className="detail__content">
        <div className="detail__header">
          <h1>{listing.brand} {listing.model}, {listing.year}</h1>
          <span className={`detail__status detail__status--${listing.status}`}>
            {sold ? 'Продан' : 'Продаётся'}
          </span>
        </div>

        <p className="detail__price">
          {listing.price.toLocaleString()} {listing.currency}
        </p>

        <table className="detail__specs">
          <tbody>
            {specs.filter(([, v]) => v).map(([label, value]) => (
              <tr key={label}>
                <td className="detail__spec-label">{label}</td>
                <td className="detail__spec-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {listing.description && (
          <p className="detail__description">{listing.description}</p>
        )}

        <div className="detail__contacts">
          {ownerTg && (
            <a className="detail__btn detail__btn--tg" href={`tg://resolve?domain=${ownerTg}`}>
              Написать в Telegram
            </a>
          )}
          {ownerWa && (
            <a className="detail__btn detail__btn--wa" href={`https://wa.me/${ownerWa}`} target="_blank" rel="noreferrer">
              Написать в WhatsApp
            </a>
          )}
          {ownerPhone && (
            <a className="detail__btn detail__btn--phone" href={`tel:${ownerPhone}`}>
              Позвонить
            </a>
          )}
        </div>

        <button className="detail__share" onClick={handleShare}>
          Поделиться
        </button>

        {isOwner && (
          <div className="detail__owner-actions">
            <button onClick={() => navigate(`/listing/${id}/edit`)}>
              Редактировать
            </button>
            <button className="detail__delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        )}
      </div>

      {toast && <div className="detail__toast">Ссылка скопирована</div>}
    </div>
  )
}
