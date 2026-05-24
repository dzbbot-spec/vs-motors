import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { showConfirm } from '../lib/telegram'
import BottomNav from '../components/BottomNav'
import type { Listing } from '../types'

export default function AdminPage() {
  const nav = useNavigate()
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Listing[]>('/api/admin/listings')
      setItems(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Удалить объявление? Это действие нельзя отменить.')
    if (!ok) return
    try {
      await api.delete(`/api/listings/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const handleToggle = async (item: Listing) => {
    const newStatus = item.status === 'active' ? 'sold' : 'active'
    try {
      const updated = await api.patch<Listing>(`/api/listings/${item.id}`, { status: newStatus })
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">Управление</div>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 14 }}
          onClick={() => nav('/add')}
        >
          + Добавить
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner spinner--dark" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <div className="empty-state__text">Объявлений нет</div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => nav('/add')}
          >
            Добавить первое
          </button>
        </div>
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} className="admin-card">
              <div className="admin-card__thumb">
                {item.photos[0] ? (
                  <img src={item.photos[0]} alt={`${item.brand} ${item.model}`} loading="lazy" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    🚗
                  </div>
                )}
              </div>

              <div className="admin-card__info">
                <div className="admin-card__name">{item.brand} {item.model} {item.year}</div>
                <div className="admin-card__price">
                  {item.price.toLocaleString('ru-RU')} {item.currency}
                  {' '}
                  <span className={`status-badge status-badge--${item.status}`}>
                    {item.status === 'active' ? 'активно' : 'продано'}
                  </span>
                </div>
              </div>

              <div className="admin-card__actions">
                <button
                  className="icon-btn"
                  title={item.status === 'active' ? 'Отметить продано' : 'Вернуть в продажу'}
                  onClick={() => handleToggle(item)}
                >
                  {item.status === 'active' ? '✓' : '↩'}
                </button>
                <button
                  className="icon-btn"
                  title="Редактировать"
                  onClick={() => nav(`/listing/${item.id}/edit`)}
                >
                  ✏
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  title="Удалить"
                  onClick={() => handleDelete(item.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <BottomNav />
    </div>
  )
}
