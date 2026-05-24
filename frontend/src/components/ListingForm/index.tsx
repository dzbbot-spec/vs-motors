import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { ListingFull } from '../../types'
import type { FormData } from './types'
import { EMPTY_FORM } from './types'
import { useBackButton } from '../../hooks/useBackButton'
import Step1Basic from './Step1Basic'
import Step2Specs from './Step2Specs'
import Step3Photos from './Step3Photos'
import './ListingForm.css'

interface Props { initial?: ListingFull }

const STEPS = ['Основное', 'Характеристики', 'Фото', 'Публикация']

export default function ListingForm({ initial }: Props) {
  const navigate = useNavigate()
  useBackButton()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<FormData>(() =>
    initial ? {
      brand: initial.brand, model: initial.model,
      year: String(initial.year), price: String(initial.price),
      currency: initial.currency as 'USD' | 'ILS',
      status: initial.status as 'active' | 'sold',
      mileage: initial.mileage != null ? String(initial.mileage) : '',
      transmission: initial.transmission ?? '',
      fuel_type: initial.fuel_type ?? '',
      body_type: initial.body_type ?? '',
      color: initial.color ?? '',
      engine_volume: initial.engine_volume != null ? String(initial.engine_volume) : '',
      power_hp: initial.power_hp != null ? String(initial.power_hp) : '',
      drive_type: initial.drive_type ?? '',
      vin: initial.vin ?? '',
      country: initial.country ?? '',
      description: initial.description ?? '',
      existingPhotos: initial.photos,
      newPhotoFiles: [],
    } : EMPTY_FORM
  )

  const patch = (p: Partial<FormData>) => setData(d => ({ ...d, ...p }))

  const canNext = step !== 0 || (data.brand.trim() && data.model.trim() && data.year && data.price)

  const uploadPhotos = async (listingId: string): Promise<string[]> => {
    const urls: string[] = []
    for (const file of data.newPhotoFiles) {
      const sig = await api.post<{
        timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string
      }>(`/api/listings/${listingId}/photos`, {})

      const form = new FormData()
      form.append('file', file)
      form.append('api_key', sig.api_key)
      form.append('timestamp', String(sig.timestamp))
      form.append('signature', sig.signature)
      form.append('folder', sig.folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, { method: 'POST', body: form })
      const json = await res.json()
      if (json.secure_url) urls.push(json.secure_url)
    }
    return urls
  }

  const handlePublish = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        brand: data.brand.trim(), model: data.model.trim(),
        year: Number(data.year), price: Number(data.price),
        currency: data.currency, status: data.status,
        mileage: data.mileage ? Number(data.mileage) : null,
        transmission: data.transmission || null,
        fuel_type: data.fuel_type || null,
        body_type: data.body_type || null,
        color: data.color || null,
        engine_volume: data.engine_volume ? Number(data.engine_volume) : null,
        power_hp: data.power_hp ? Number(data.power_hp) : null,
        drive_type: data.drive_type || null,
        vin: data.vin || null,
        country: data.country || null,
        description: data.description || null,
      }

      let id: string
      if (initial) {
        const updated = await api.patch<ListingFull>(`/api/listings/${initial.id}`, payload)
        id = updated.id
        const newUrls = await uploadPhotos(id)
        await api.patch(`/api/listings/${id}`, { photos: [...data.existingPhotos, ...newUrls] })
      } else {
        const created = await api.post<ListingFull>('/api/listings', { ...payload, photos: [] })
        id = created.id
        const newUrls = await uploadPhotos(id)
        if (newUrls.length > 0) {
          await api.patch(`/api/listings/${id}`, { photos: newUrls })
        }
      }

      navigate(`/listing/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lform">
      <div className="lform__steps">
        {STEPS.map((title, i) => (
          <div key={i} className={`lform__dot${i === step ? ' lform__dot--active' : ''}${i < step ? ' lform__dot--done' : ''}`} onClick={() => i < step && setStep(i)}>
            <span>{i < step ? '✓' : i + 1}</span>
            <small>{title}</small>
          </div>
        ))}
      </div>

      {error && <p className="lform__error">{error}</p>}

      <div className="lform__body">
        {step === 0 && <Step1Basic data={data} onChange={patch} />}
        {step === 1 && <Step2Specs data={data} onChange={patch} />}
        {step === 2 && <Step3Photos data={data} onChange={patch} />}
        {step === 3 && (
          <div className="lform__preview">
            <h2>{data.brand} {data.model}, {data.year}</h2>
            <p className="lform__preview-price">{Number(data.price).toLocaleString()} {data.currency}</p>
            <p>Статус: {data.status === 'active' ? 'Продаётся' : 'Продан'}</p>
            {data.mileage && <p>Пробег: {Number(data.mileage).toLocaleString()} км</p>}
            {data.description && <p className="lform__preview-desc">{data.description}</p>}
            <p className="lform__preview-photos">Фото: {data.existingPhotos.length + data.newPhotoFiles.length} шт.</p>
          </div>
        )}
      </div>

      <div className="lform__nav">
        {step > 0 && <button className="lform__btn-back" onClick={() => setStep(s => s - 1)}>Назад</button>}
        {step < 3
          ? <button className="lform__btn-next" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Далее</button>
          : <button className="lform__btn-publish" onClick={handlePublish} disabled={saving}>
              {saving ? 'Сохранение...' : initial ? 'Сохранить' : 'Опубликовать'}
            </button>
        }
      </div>
    </div>
  )
}
