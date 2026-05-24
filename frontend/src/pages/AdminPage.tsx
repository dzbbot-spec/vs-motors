import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Listing } from '../types'
import { useBackButton } from '../hooks/useBackButton'
import './AdminPage.css'

export default function AdminPage() {
  const navigate = useNavigate()
  useBackButton()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    api.get<Listing[]>('/api/admin/listings')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (item: Listing) => {
    setToggling(item.id)
    const newStatus = item.status === 'active' ? 'sold' : 'active'
    try {
      await api.patch(`/api/listings/${item.id}`, { status: newStatus })
      setItems(prev => prev.map(l => l.id === item.id ? { ...l, status: newStatus } : l))
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить объявление?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/listings/${id}`)
      setItems(prev => prev.filter(l => l.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className="admin__loading">Загрузка...</div>
  )

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
                {item.photos[0]
                  ? <img src={item.photos[0]} alt="" />
                  : <span>🚗</span>
                }
              </div>

              <div className="admin__info" onClick={() => navigate(`/listing/${item.id}`)}>
                <p className="admin__title">{item.brand} {item.model}, {item.year}</p>
                <p className="admin__price">{item.price.toLocaleString()} {item.currency}</p>
                <p className="admin__date">
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="admin__actions">
                <button
                  className={`admin__status-btn admin__status-btn--${item.status}`}
                  onClick={() => toggleStatus(item)}
                  disabled={toggling === item.id}
                >
                  {toggling === item.id
                    ? '...'
                    : item.status === 'active' ? 'Продаётся' : 'Продан'}
                </button>
                <div className="admin__row">
                  <button
                    className="admin__edit-btn"
                    onClick={() => navigate(`/listing/${item.id}/edit`)}
                  >
                    Изменить
                  </button>
                  <button
                    className="admin__delete-btn"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? '...' : 'Удалить'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
