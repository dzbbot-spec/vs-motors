import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useBackButton } from '../hooks/useBackButton'
import ListingForm, { type ListingFormData } from '../components/ListingForm'
import type { ListingFull } from '../types'

export default function AddListingPage() {
  useBackButton()
  const nav = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ListingFormData, photos: string[]) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        brand: data.brand.trim(),
        model: data.model.trim(),
        year: parseInt(data.year),
        price: parseInt(data.price),
        currency: data.currency,
        mileage: data.mileage ? parseInt(data.mileage) : null,
        transmission: data.transmission || null,
        fuel_type: data.fuel_type || null,
        body_type: data.body_type || null,
        color: data.color.trim() || null,
        engine_volume: data.engine_volume ? parseFloat(data.engine_volume) : null,
        power_hp: data.power_hp ? parseInt(data.power_hp) : null,
        drive_type: data.drive_type || null,
        vin: data.vin.trim() || null,
        country: data.country.trim() || null,
        description: data.description.trim() || null,
        photos,
        status: 'active',
      }
      const created = await api.post<ListingFull>('/api/listings', payload)
      nav(`/listing/${created.id}`, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
      setSaving(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
      <div className="page-header">
        <div className="page-header__title">Новое объявление</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <ListingForm
        onSubmit={handleSubmit}
        submitLabel="Опубликовать"
        isSubmitting={saving}
        serverError={error}
      />
    </div>
  )
}
