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
  /* vertical → компактная плитка, horizontal → широкий список */
  const isGrid = layout === 'vertical'

  const cls = [
    'listing-card',
    isGrid ? 'listing-card--grid' : '',
    item.status === 'sold' ? 'listing-card--sold' : '',
  ].filter(Boolean).join(' ')

  return (
    <article className={cls} onClick={() => nav(`/listing/${item.id}`)}>
      <div className="listing-card__photo">
        {photo && <img src={photo} alt={item.brand} loading="lazy" />}
        <div className="listing-card__badge">
          <i></i>
          {item.status === 'active' ? 'В продаже' : 'Продано'}
        </div>
      </div>
      <div className="listing-card__body">
        <p className="listing-card__title">{item.brand} {item.model}</p>
        <div className="listing-card__specs">
          {item.year && <span>{item.year}</span>}
          {item.mileage != null && <span>{item.mileage.toLocaleString('ru-RU')} км</span>}
          {item.transmission && TRANSMISSION[item.transmission] && (
            <span>{TRANSMISSION[item.transmission]}</span>
          )}
          {item.fuel_type && FUEL[item.fuel_type] && (
            <span>{FUEL[item.fuel_type]}</span>
          )}
        </div>
        <div className="listing-card__price">
          {item.price.toLocaleString('ru-RU')}
          <small>{item.currency || 'RUB'}</small>
        </div>
      </div>
    </article>
  )
}
