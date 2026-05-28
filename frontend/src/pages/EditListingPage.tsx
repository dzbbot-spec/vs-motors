import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useBackButton } from '../hooks/useBackButton'
import ListingForm, { type ListingFormData } from '../components/ListingForm'
import type { ListingFull } from '../types'

export default function EditListingPage() {
  useBackButton()
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()

  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api.get<ListingFull>(`/api/listings/${id}`)
      .then(setListing)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: ListingFormData, photos: string[]) => {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      if (data.brand) payload.brand = data.brand.trim()
      if (data.model) payload.model = data.model.trim()
      if (data.year) payload.year = parseInt(data.year)
      if (data.price) payload.price = parseInt(data.price)
      if (data.currency) payload.currency = data.currency
      payload.mileage = data.mileage ? parseInt(data.mileage) : null
      payload.transmission = data.transmission || null
      payload.fuel_type = data.fuel_type || null
      payload.body_type = data.body_type || null
      payload.color = data.color.trim() || null
      payload.engine_volume = data.engine_volume ? parseFloat(data.engine_volume) : null
      payload.power_hp = data.power_hp ? parseInt(data.power_hp) : null
      payload.drive_type = data.drive_type || null
      payload.vin = data.vin.trim() || null
      payload.country = data.country.trim() || null
      payload.description = data.description.trim() || null
      payload.owners_count = data.owners_count
      payload.has_accidents = data.has_accidents
      payload.pts_original = data.pts_original
      payload.service_history = data.service_history
      payload.customs_cleared = data.customs_cleared
      payload.photos = photos

      await api.patch<ListingFull>(`/api/listings/${id}`, payload)
      nav(`/listing/${id}`, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header__title">Редактировать</div>
        </div>
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner spinner--dark" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="page">
        <div className="error-msg">{error ?? 'Объявление не найдено'}</div>
      </div>
    )
  }

  const initial: Partial<ListingFormData> = {
    brand: listing.brand,
    model: listing.model,
    year: String(listing.year),
    price: String(listing.price),
    currency: listing.currency,
    mileage: listing.mileage != null ? String(listing.mileage) : '',
    transmission: listing.transmission ?? '',
    fuel_type: listing.fuel_type ?? '',
    body_type: listing.body_type ?? '',
    color: listing.color ?? '',
    engine_volume: listing.engine_volume != null ? String(listing.engine_volume) : '',
    power_hp: listing.power_hp != null ? String(listing.power_hp) : '',
    drive_type: listing.drive_type ?? '',
    vin: listing.vin ?? '',
    country: listing.country ?? '',
    description: listing.description ?? '',
    owners_count: listing.owners_count ?? null,
    has_accidents: listing.has_accidents ?? false,
    pts_original: listing.pts_original ?? true,
    service_history: listing.service_history ?? false,
    customs_cleared: listing.customs_cleared ?? true,
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
      <div className="page-header">
        <div className="page-header__title">Редактировать</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <ListingForm
        initial={initial}
        initialPhotos={listing.photos}
        onSubmit={handleSubmit}
        submitLabel="Сохранить"
        isSubmitting={saving}
        serverError={error}
      />
    </div>
  )
}
