import { useNavigate } from 'react-router-dom'
import type { Listing } from '../types'
import './CarCard.css'

const TX: Record<string, string> = { AUTO: 'Автомат', MANUAL: 'Механика', CVT: 'Вариатор', ROBOT: 'Робот' }
const FL: Record<string, string> = { PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ' }

export default function CarCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate()
  const sold = listing.status === 'sold'

  return (
    <div className={`car-card${sold ? ' car-card--sold' : ''}`} onClick={() => navigate(`/listing/${listing.id}`)}>
      <div className="car-card__photo">
        {listing.photos[0]
          ? <img src={listing.photos[0]} alt={`${listing.brand} ${listing.model}`} loading="lazy" />
          : <div className="car-card__no-photo">🚗</div>
        }
        {sold && <span className="car-card__badge">Продан</span>}
      </div>
      <div className="car-card__body">
        <h3 className="car-card__title">{listing.brand} {listing.model}, {listing.year}</h3>
        <p className="car-card__price">{listing.price.toLocaleString()} {listing.currency}</p>
        <div className="car-card__meta">
          {listing.mileage != null && <span>{listing.mileage.toLocaleString()} км</span>}
          {listing.transmission && <span>{TX[listing.transmission] ?? listing.transmission}</span>}
          {listing.fuel_type && <span>{FL[listing.fuel_type] ?? listing.fuel_type}</span>}
        </div>
      </div>
    </div>
  )
}
