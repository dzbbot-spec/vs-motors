import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'

export interface ListingFormData {
  brand: string
  model: string
  year: string
  price: string
  currency: string
  mileage: string
  transmission: string
  fuel_type: string
  body_type: string
  color: string
  engine_volume: string
  power_hp: string
  drive_type: string
  vin: string
  country: string
  description: string
}

interface PhotoEntry {
  url: string
  uploading: boolean
}

interface Props {
  initial?: Partial<ListingFormData>
  initialPhotos?: string[]
  onSubmit: (data: ListingFormData, photos: string[]) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  serverError?: string | null
}

const STEP_LABELS = ['Основное', 'Характеристики', 'Детали', 'Фото']

const TRANSMISSIONS = ['Автомат', 'Механика', 'Робот', 'Вариатор']
const FUELS = ['Бензин', 'Дизель', 'Гибрид', 'Электро', 'Газ']
const BODIES = ['Седан', 'Кроссовер', 'Внедорожник', 'Хэтчбек', 'Универсал', 'Купе', 'Кабриолет', 'Минивэн', 'Пикап']
const DRIVES = ['Передний', 'Задний', 'Полный (AWD)', 'Полный (4WD)']

const defaultCurrency = import.meta.env.VITE_CURRENCY ?? 'USD'

const defaultForm: ListingFormData = {
  brand: '', model: '', year: '', price: '', currency: defaultCurrency,
  mileage: '', transmission: '', fuel_type: '', body_type: '', color: '',
  engine_volume: '', power_hp: '', drive_type: '', vin: '', country: '',
  description: '',
}

export default function ListingForm({
  initial = {},
  initialPhotos = [],
  onSubmit,
  submitLabel = 'Опубликовать',
  isSubmitting = false,
  serverError = null,
}: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ListingFormData>({ ...defaultForm, ...initial })
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    initialPhotos.map(url => ({ url, uploading: false }))
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})
  const [tapCount, setTapCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Прогрев бэкенда при переходе на последний шаг
  useEffect(() => {
    if (step === 3) {
      fetch('/health').catch(() => { /* silent */ })
    }
  }, [step])

  const set = (field: keyof ListingFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: undefined }))
  }

  const validateStep = (): boolean => {
    if (step === 0) {
      const errs: typeof errors = {}
      if (!form.brand.trim()) errs.brand = 'Укажите марку'
      if (!form.model.trim()) errs.model = 'Укажите модель'
      if (!form.year || isNaN(Number(form.year))) errs.year = 'Укажите год'
      if (!form.price || isNaN(Number(form.price))) errs.price = 'Укажите цену'
      setErrors(errs)
      return Object.keys(errs).length === 0
    }
    return true
  }

  const goNext = () => {
    if (!validateStep()) return
    setStep(s => Math.min(3, s + 1))
  }

  const goPrev = () => setStep(s => Math.max(0, s - 1))

  const handleFiles = async (files: FileList) => {
    const fileArr = Array.from(files).slice(0, 10 - photos.length)
    const newEntries: PhotoEntry[] = fileArr.map(f => ({
      url: URL.createObjectURL(f),
      uploading: true,
    }))
    setPhotos(p => [...p, ...newEntries])

    // Получаем подпись один раз для всего батча
    let sigData: { timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string }
    try {
      sigData = await api.post('/api/owner/upload-signature', {})
    } catch {
      setPhotos(p => p.filter(e => !newEntries.some(n => n.url === e.url)))
      return
    }

    await Promise.all(fileArr.map(async (file, i) => {
      const localUrl = newEntries[i].url
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', sigData.api_key)
        fd.append('timestamp', String(sigData.timestamp))
        fd.append('signature', sigData.signature)
        fd.append('folder', sigData.folder)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
          { method: 'POST', body: fd }
        )
        const cloud = await res.json()
        const cloudUrl: string = cloud.secure_url

        setPhotos(p => {
          const idx = p.findIndex(e => e.url === localUrl)
          if (idx === -1) return p
          const next = [...p]
          next[idx] = { url: cloudUrl, uploading: false }
          return next
        })
      } catch {
        setPhotos(p => p.filter(e => e.url !== localUrl))
      }
    }))
  }

  const removePhoto = (url: string) => {
    setPhotos(p => p.filter(e => e.url !== url))
  }

  const handleSubmit = async () => {
    setTapCount(c => c + 1)
    if (!validateStep()) return
    const urls = photos.filter(p => !p.uploading).map(p => p.url)
    await onSubmit(form, urls)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Step indicator */}
      <div className="step-indicator">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
        ))}
        <span className="step-label">{STEP_LABELS[step]}</span>
      </div>

      {/* Step 0: Basic info */}
      {step === 0 && (
        <div className="form-step">
          <div className="field">
            <label>Марка *</label>
            <input value={form.brand} onChange={set('brand')} placeholder="Toyota, BMW, Mercedes..." />
            {errors.brand && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.brand}</span>}
          </div>
          <div className="field">
            <label>Модель *</label>
            <input value={form.model} onChange={set('model')} placeholder="Camry, X5, E-Class..." />
            {errors.model && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.model}</span>}
          </div>
          <div className="field-row">
            <div className="field">
              <label>Год *</label>
              <input
                type="number"
                value={form.year}
                onChange={set('year')}
                placeholder="2023"
                min="1970"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.year}</span>}
            </div>
            <div className="field">
              <label>Валюта</label>
              <select value={form.currency} onChange={set('currency')}>
                <option value="USD">USD</option>
                <option value="ILS">ILS</option>
                <option value="EUR">EUR</option>
                <option value="RUB">RUB</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Цена *</label>
            <input
              type="number"
              value={form.price}
              onChange={set('price')}
              placeholder="25000"
              min="0"
            />
            {errors.price && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.price}</span>}
          </div>
        </div>
      )}

      {/* Step 1: Characteristics */}
      {step === 1 && (
        <div className="form-step">
          <div className="field">
            <label>Пробег (км)</label>
            <input
              type="number"
              value={form.mileage}
              onChange={set('mileage')}
              placeholder="50000"
              min="0"
            />
          </div>
          <div className="field">
            <label>Коробка передач</label>
            <select value={form.transmission} onChange={set('transmission')}>
              <option value="">Не указано</option>
              {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Тип топлива</label>
            <select value={form.fuel_type} onChange={set('fuel_type')}>
              <option value="">Не указано</option>
              {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Кузов</label>
            <select value={form.body_type} onChange={set('body_type')}>
              <option value="">Не указано</option>
              {BODIES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Цвет</label>
            <input value={form.color} onChange={set('color')} placeholder="Белый, чёрный..." />
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="form-step">
          <div className="field-row">
            <div className="field">
              <label>Объём двигателя (л)</label>
              <input
                type="number"
                step="0.1"
                value={form.engine_volume}
                onChange={set('engine_volume')}
                placeholder="2.0"
              />
            </div>
            <div className="field">
              <label>Мощность (л.с.)</label>
              <input
                type="number"
                value={form.power_hp}
                onChange={set('power_hp')}
                placeholder="150"
              />
            </div>
          </div>
          <div className="field">
            <label>Привод</label>
            <select value={form.drive_type} onChange={set('drive_type')}>
              <option value="">Не указано</option>
              {DRIVES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>VIN</label>
            <input
              value={form.vin}
              onChange={set('vin')}
              placeholder="WBA..."
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="field">
            <label>Страна происхождения</label>
            <input value={form.country} onChange={set('country')} placeholder="Германия, Япония..." />
          </div>
        </div>
      )}

      {/* Step 3: Photos + description */}
      {step === 3 && (
        <div className="form-step">
          <div className="field">
            <label>Фотографии</label>
            <div
              className="photo-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={{ fontSize: 28 }}>📷</span>
              <span>Нажмите для добавления фото</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {photos.length > 0 ? `Добавлено: ${photos.length}/10` : 'До 10 фото'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={p.url} alt={`Фото ${i + 1}`} />
                    {p.uploading ? (
                      <div className="photo-thumb__uploading">
                        <div className="spinner" />
                      </div>
                    ) : (
                      <button
                        className="photo-thumb__del"
                        onClick={() => removePhoto(p.url)}
                        aria-label="Удалить фото"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="field">
            <label>Описание</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Расскажите об автомобиле..."
              rows={5}
            />
          </div>
        </div>
      )}

      {/* DEBUG — удалить после диагностики */}
      {step === 3 && (
        <div style={{ margin: '0 16px 8px', padding: 8, background: '#fef9c3', borderRadius: 8, fontSize: 12, color: '#713f12' }}>
          taps:{tapCount} photos:{photos.length} uploading:{photos.filter(p => p.uploading).length} saving:{isSubmitting ? 'yes' : 'no'}
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div className="error-msg" style={{ margin: '0 16px 8px' }}>{serverError}</div>
      )}

      {/* Navigation */}
      <div className="form-nav">
        {step > 0 && (
          <button className="btn btn-secondary" onClick={goPrev} style={{ flex: 1 }}>
            Назад
          </button>
        )}
        {step < 3 ? (
          <button className="btn btn-primary" onClick={goNext} style={{ flex: 2 }}>
            Далее
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || photos.some(p => p.uploading)}
            style={{ flex: 2 }}
          >
            {isSubmitting ? <><div className="spinner" /> Сохранение...</> : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}
