import { useNavigate } from 'react-router-dom'
import type { Listing } from '../types'

const FUEL: Record<string, string> = {
  PETROL: 'Бензин', DIESEL: 'Дизель', HYBRID: 'Гибрид', ELECTRIC: 'Электро', GAS: 'Газ',
}
const TRANSMISSION: Record<string, string> = {
  AUTO: 'Автомат', MANUAL: 'Механика', ROBOT: 'Робот', CVT: 'Вариатор',
}

interface Props {
  item: Listing
  layout?: 'horizontal' | 'vertical'
}

export default function CarCard({ item, layout = 'vertical' }: Props) {
  const nav = useNavigate()
  const photo = item.photos[0] ?? null

  const price = item.price.toLocaleString('ru-RU')

  const meta = [
    item.year,
    item.mileage != null ? `${item.mileage.toLocaleString('ru-RU')} км` : null,
    item.transmission ? (TRANSMISSION[item.transmission] ?? null) : null,
    item.fuel_type ? (FUEL[item.fuel_type] ?? null) : null,
  ].filter(Boolean).join(' · ')

  const cls = [
    'car-card',
    item.status === 'sold' ? 'car-card--sold' : '',
    layout === 'horizontal' ? 'car-card--horizontal' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} onClick={() => nav(`/listing/${item.id}`)}>
      <div className="car-card__photo">
        {photo && <img src={photo} alt={`${item.brand} ${item.model}`} loading="lazy" />}
      </div>

      <div className="car-card__body">
        <div className="car-card__title">{item.brand} {item.model}</div>
        {meta && <div className="car-card__meta">{meta}</div>}
        <div className="car-card__footer">
          <div className="car-card__price">{price} {item.currency}</div>
          {item.status === 'sold' && <span className="car-card__badge">Продано</span>}
        </div>
      </div>
    </div>
  )
}
