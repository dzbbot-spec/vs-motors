import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useBackButton } from '../hooks/useBackButton'
import type { Listing } from '../types'
import './AdminPage.css'

export default function AdminPage() {
  const navigate = useNavigate()
  useBackButton()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Listing[]>('/api/admin/listings').then(setItems).finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (item: Listing) => {
    const status = item.status === 'active' ? 'sold' : 'active'
    await api.patch(`/api/listings/${item.id}`, { status })
    setItems(prev => prev.map(l => l.id === item.id ? { ...l, status } : l))
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить?')) return
    await api.delete(`/api/listings/${id}`)
    setItems(prev => prev.filter(l => l.id !== id))
  }

  if (loading) return <div className="admin__loading">Загрузка...</div>

  return (
    <div className="admin">
      <header className="admin__header">
        <h1>Управление</h1>
        <button onClick={() => navigate('/add')}>+ Добавить</button>
      </header>

      {items.length === 0 ? (
        <div className="admin__empty">Объявлений нет</div>
      ) : (
        <div className="admin__list">
          {items.map(item => (
            <div key={item.id} className={`admin__item${item.status === 'sold' ? ' admin__item--sold' : ''}`}>
              <div className="admin__thumb" onClick={() => navigate(`/listing/${item.id}`)}>
                {item.photos[0] ? <img src={item.photos[0]} alt="" /> : <span>🚗</span>}
              </div>
              <div className="admin__info" onClick={() => navigate(`/listing/${item.id}`)}>
                <p className="admin__title">{item.brand} {item.model}, {item.year}</p>
                <p className="admin__price">{item.price.toLocaleString()} {item.currency}</p>
              </div>
              <div className="admin__actions">
                <button className={`admin__status admin__status--${item.status}`} onClick={() => toggleStatus(item)}>
                  {item.status === 'active' ? 'Продаётся' : 'Продан'}
                </button>
                <div className="admin__row">
                  <button onClick={() => navigate(`/listing/${item.id}/edit`)}>Изменить</button>
                  <button className="admin__del" onClick={() => handleDelete(item.id)}>Удалить</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
