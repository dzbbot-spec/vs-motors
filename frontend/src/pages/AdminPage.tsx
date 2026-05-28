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
      setError(e instanceof Error ? e.message : 'Ошибка удаления')
    }
  }

  const handleToggle = async (item: Listing) => {
    const newStatus = item.status === 'active' ? 'sold' : 'active'
    try {
      const updated = await api.patch<Listing>(`/api/listings/${item.id}`, { status: newStatus })
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title">Управление</div>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto', width: 'auto', padding: '8px 16px', fontSize: 14 }}
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
          <div className="empty-state__text">Объявлений нет</div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8, width: 'auto', padding: '12px 24px' }}
            onClick={() => nav('/add')}
          >
            Добавить первое
          </button>
        </div>
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} className="admin-row">
              <div className="admin-row__thumb">
                {item.photos[0] && (
                  <img src={item.photos[0]} alt={`${item.brand} ${item.model}`} loading="lazy" />
                )}
              </div>

              <div className="admin-row__info">
                <div className="admin-row__name">{item.brand} {item.model} {item.year}</div>
                <div className="admin-row__meta">
                  {item.price.toLocaleString('ru-RU')} {item.currency}
                  {' · '}
                  {item.status === 'active' ? 'В продаже' : 'Продано'}
                  {' · '}
                  <span className="admin-views">{item.views || 0} просм.</span>
                </div>
              </div>

              <div className="admin-row__actions">
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 'auto' }}
                  onClick={() => nav(`/listing/${item.id}/edit`)}
                >
                  Изменить
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 'auto' }}
                  onClick={() => handleToggle(item)}
                >
                  {item.status === 'active' ? 'Продано' : 'В продаже'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 'auto', color: 'var(--danger)' }}
                  onClick={() => handleDelete(item.id)}
                >
                  Удалить
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
