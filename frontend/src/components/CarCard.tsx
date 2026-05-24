import { useNavigate } from 'react-router-dom'
import type { Listing } from '../types'

interface Props {
  item: Listing
}

export default function CarCard({ item }: Props) {
  const nav = useNavigate()
  const photo = item.photos[0] ?? null

  const price = item.price.toLocaleString('ru-RU')

  return (
    <div className="car-card" onClick={() => nav(`/listing/${item.id}`)}>
      <div className="car-card__photo">
        {photo ? (
          <img src={photo} alt={`${item.brand} ${item.model}`} loading="lazy" />
        ) : (
          <div className="car-card__no-photo">🚗</div>
        )}
        {item.status === 'sold' && <span className="badge-sold">Продано</span>}
      </div>

      <div className="car-card__info">
        <div className="car-card__title">{item.brand} {item.model}</div>
        <div className="car-card__meta">
          {item.year}
          {item.mileage != null && <> · {item.mileage.toLocaleString('ru-RU')} км</>}
          {item.fuel_type && <> · {item.fuel_type}</>}
        </div>
        <div className="car-card__price">
          {price} {item.currency}
        </div>
      </div>
    </div>
  )
}
