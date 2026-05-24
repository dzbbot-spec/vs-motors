import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useTelegram } from '../hooks/useTelegram'
import { useBackButton } from '../hooks/useBackButton'
import type { ListingFull } from '../types'
import './ListingDetailPage.css'

const TX: Record<string, string> = { AUTO: 'Автомат', MANUAL: 'Механика', CVT: 'Вариатор', ROBOT: 'Робот' }
const FL: Record<string, string> = { PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ' }
const BD: Record<string, string> = { SEDAN: 'Седан', HATCHBACK: 'Хэтчбек', SUV: 'Внедорожник', MINIVAN: 'Минивэн', COUPE: 'Купе', WAGON: 'Универсал', CONVERTIBLE: 'Кабриолет', PICKUP: 'Пикап' }
const DR: Record<string, string> = { FWD: 'Передний', RWD: 'Задний', AWD: 'Полный' }

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOwner } = useTelegram()
  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [photo, setPhoto] = useState(0)
  const [toast, setToast] = useState(false)
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
    await api.delete(`/api/listings/${id}`)
    navigate('/')
  }

  if (loading) return <div className="detail__loading">Загрузка...</div>
  if (!listing) return null

  const sold = listing.status === 'sold'
  const photos = listing.photos

  const specs: [string, string | null | undefined][] = [
    ['Пробег', listing.mileage != null ? `${listing.mileage.toLocaleString()} км` : null],
    ['Год', String(listing.year)],
    ['КПП', listing.transmission ? (TX[listing.transmission] ?? listing.transmission) : null],
    ['Топливо', listing.fuel_type ? (FL[listing.fuel_type] ?? listing.fuel_type) : null],
    ['Кузов', listing.body_type ? (BD[listing.body_type] ?? listing.body_type) : null],
    ['Цвет', listing.color],
    ['Объём', listing.engine_volume != null ? `${listing.engine_volume} л` : null],
    ['Мощность', listing.power_hp != null ? `${listing.power_hp} л.с.` : null],
    ['Привод', listing.drive_type ? (DR[listing.drive_type] ?? listing.drive_type) : null],
    ['VIN', listing.vin],
    ['Страна', listing.country],
  ]

  return (
    <div className="detail">
      {photos.length > 0 && (
        <div className="detail__gallery">
          <img src={photos[photo]} alt="" className="detail__gallery-img" />
          {photos.length > 1 && (
            <div className="detail__dots">
              {photos.map((_, i) => (
                <span key={i} className={`detail__dot${i === photo ? ' detail__dot--active' : ''}`} onClick={() => setPhoto(i)} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="detail__content">
        <div className="detail__header">
          <h1>{listing.brand} {listing.model}, {listing.year}</h1>
          <span className={`detail__status detail__status--${listing.status}`}>
            {sold ? 'Продан' : 'Продаётся'}
          </span>
        </div>

        <p className="detail__price">{listing.price.toLocaleString()} {listing.currency}</p>

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

        {listing.description && <p className="detail__description">{listing.description}</p>}

        <div className="detail__contacts">
          {import.meta.env.VITE_OWNER_TG_USERNAME && (
            <a className="detail__btn detail__btn--tg" href={`tg://resolve?domain=${import.meta.env.VITE_OWNER_TG_USERNAME}`}>
              Написать в Telegram
            </a>
          )}
          {import.meta.env.VITE_OWNER_WHATSAPP && (
            <a className="detail__btn detail__btn--wa" href={`https://wa.me/${import.meta.env.VITE_OWNER_WHATSAPP}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
          {import.meta.env.VITE_OWNER_PHONE && (
            <a className="detail__btn detail__btn--phone" href={`tel:${import.meta.env.VITE_OWNER_PHONE}`}>
              Позвонить
            </a>
          )}
        </div>

        <button className="detail__share" onClick={handleShare}>Поделиться</button>

        {isOwner && (
          <div className="detail__owner">
            <button onClick={() => navigate(`/listing/${id}/edit`)}>Редактировать</button>
            <button className="detail__delete" onClick={handleDelete}>Удалить</button>
          </div>
        )}
      </div>

      {toast && <div className="detail__toast">Ссылка скопирована</div>}
    </div>
  )
}
