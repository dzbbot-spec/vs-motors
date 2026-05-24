import { useNavigate } from 'react-router-dom'
import { Listing } from '../types'
import './CarCard.css'

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTO: 'Автомат', MANUAL: 'Механика', CVT: 'Вариатор', ROBOT: 'Робот',
}
const FUEL_LABELS: Record<string, string> = {
  PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид',
  ELECTRIC: 'Электро', GAS: 'Газ',
}

interface Props {
  listing: Listing
}

export default function CarCard({ listing }: Props) {
  const navigate = useNavigate()
  const photo = listing.photos[0]
  const sold = listing.status === 'sold'

  return (
    <div
      className={`car-card${sold ? ' car-card--sold' : ''}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      <div className="car-card__photo">
        {photo
          ? <img src={photo} alt={`${listing.brand} ${listing.model}`} loading="lazy" />
          : <div className="car-card__photo-placeholder">🚗</div>
        }
        {sold && <span className="car-card__sold-badge">Продан</span>}
      </div>
      <div className="car-card__body">
        <h3 className="car-card__title">
          {listing.brand} {listing.model}, {listing.year}
        </h3>
        <p className="car-card__price">
          {listing.price.toLocaleString()} {listing.currency}
        </p>
        <div className="car-card__meta">
          {listing.mileage != null && (
            <span>{listing.mileage.toLocaleString()} км</span>
          )}
          {listing.transmission && (
            <span>{TRANSMISSION_LABELS[listing.transmission] ?? listing.transmission}</span>
          )}
          {listing.fuel_type && (
            <span>{FUEL_LABELS[listing.fuel_type] ?? listing.fuel_type}</span>
          )}
        </div>
      </div>
    </div>
  )
}
