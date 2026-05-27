import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'
import BrandModelSelect from './BrandModelSelect'
import { CAR_DATABASE, type CarModel } from '../data/cars'

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

const STEP_LABELS = ['Основное', 'Характеристики', 'Детали', 'Фото и описание']

const TRANSMISSIONS: [string, string][] = [['AUTO','Автомат'],['MANUAL','Механика'],['ROBOT','Робот'],['CVT','Вариатор']]
const FUELS: [string, string][] = [['PETROL','Бензин'],['DIESEL','Дизель'],['HYBRID','Гибрид'],['ELECTRIC','Электро'],['GAS','Газ']]
const BODIES: [string, string][] = [['SEDAN','Седан'],['SUV','Кроссовер/Внедорожник'],['HATCHBACK','Хэтчбек'],['WAGON','Универсал'],['COUPE','Купе'],['CONVERTIBLE','Кабриолет'],['MINIVAN','Минивэн'],['PICKUP','Пикап']]
const DRIVES: [string, string][] = [['FWD','Передний'],['RWD','Задний'],['AWD','Полный']]

const defaultCurrency = import.meta.env.VITE_CURRENCY ?? 'USD'

const defaultForm: ListingFormData = {
  brand: '', model: '', year: '', price: '', currency: defaultCurrency,
  mileage: '', transmission: '', fuel_type: '', body_type: '', color: '',
  engine_volume: '', power_hp: '', drive_type: '', vin: '', country: '',
  description: '',
}

// Инициализируем spec по уже известным марке/модели (для режима редактирования)
function findSpec(brand: string, model: string): CarModel | null {
  const b = CAR_DATABASE.find(bi => bi.name.toLowerCase() === brand.toLowerCase())
  if (!b) return null
  return b.models.find(mi => mi.name.toLowerCase() === model.toLowerCase()) ?? null
}

// Предупреждения по году
function getYearWarnings(spec: CarModel | null, year: string): string[] {
  if (!spec || !year) return []
  const yr = parseInt(year)
  if (isNaN(yr)) return []
  if (yr < spec.years[0] || yr > spec.years[1]) {
    return [`Год вне диапазона производства (${spec.years[0]}–${spec.years[1]})`]
  }
  return []
}

// Предупреждения по КПП и топливу
function getStep1Warnings(spec: CarModel | null, form: ListingFormData): string[] {
  if (!spec) return []
  const w: string[] = []
  if (form.fuel_type && !spec.fuel.includes(form.fuel_type)) {
    w.push('Нетипичный тип топлива для этой модели')
  }
  if (form.transmission && !spec.transmission.includes(form.transmission)) {
    w.push('Нетипичная КПП для этой модели')
  }
  return w
}

// Предупреждения по двигателю и мощности
function getStep2Warnings(spec: CarModel | null, form: ListingFormData): string[] {
  if (!spec) return []
  const w: string[] = []
  if (form.engine_volume) {
    const vol = parseFloat(form.engine_volume)
    if (!isNaN(vol) && !spec.engines.includes(vol)) {
      w.push(`Нетипичный объём двигателя. Стандартные: ${spec.engines.join(', ')} л`)
    }
  }
  if (form.power_hp) {
    const hp = parseInt(form.power_hp)
    if (!isNaN(hp) && (hp < spec.power[0] || hp > spec.power[1])) {
      w.push(`Мощность вне диапазона для этой модели (${spec.power[0]}–${spec.power[1]} л.с.)`)
    }
  }
  return w
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
  const [carSpec, setCarSpec] = useState<CarModel | null>(() =>
    findSpec(initial.brand ?? '', initial.model ?? '')
  )
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

  const handleBrandChange = (brand: string) => {
    setForm(f => ({ ...f, brand, model: '' }))
    setCarSpec(null)
    setErrors(err => ({ ...err, brand: undefined, model: undefined }))
  }

  const handleModelChange = (model: string, spec?: CarModel) => {
    setForm(f => ({ ...f, model }))
    setCarSpec(spec ?? null)
    setErrors(err => ({ ...err, model: undefined }))
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
    if (!validateStep()) return
    const urls = photos.filter(p => !p.uploading).map(p => p.url)
    await onSubmit(form, urls)
  }

  // Фильтруем КПП и топливо по выбранной модели
  const availableTransmissions = carSpec
    ? TRANSMISSIONS.filter(([v]) => carSpec.transmission.includes(v))
    : TRANSMISSIONS
  const availableFuels = carSpec
    ? FUELS.filter(([v]) => carSpec.fuel.includes(v))
    : FUELS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <div className="step-hint">Шаг {step + 1} из 4 — {STEP_LABELS[step]}</div>

      {/* Step 0: Basic info */}
      {step === 0 && (
        <div className="form-step">
          <div className="field">
            <BrandModelSelect
              brand={form.brand}
              model={form.model}
              onBrandChange={handleBrandChange}
              onModelChange={handleModelChange}
            />
            {errors.brand && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.brand}</span>}
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
          {getYearWarnings(carSpec, form.year).length > 0 && (
            <div className="spec-warnings">
              {getYearWarnings(carSpec, form.year).map((w, i) => (
                <p key={i} className="spec-warning">{w}</p>
              ))}
            </div>
          )}
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
              {availableTransmissions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Тип топлива</label>
            <select value={form.fuel_type} onChange={set('fuel_type')}>
              <option value="">Не указано</option>
              {availableFuels.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Кузов</label>
            <select value={form.body_type} onChange={set('body_type')}>
              <option value="">Не указано</option>
              {BODIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Цвет</label>
            <input value={form.color} onChange={set('color')} placeholder="Белый, чёрный..." />
          </div>
          {getStep1Warnings(carSpec, form).length > 0 && (
            <div className="spec-warnings">
              {getStep1Warnings(carSpec, form).map((w, i) => (
                <p key={i} className="spec-warning">{w}</p>
              ))}
            </div>
          )}
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
              {DRIVES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
          {getStep2Warnings(carSpec, form).length > 0 && (
            <div className="spec-warnings">
              {getStep2Warnings(carSpec, form).map((w, i) => (
                <p key={i} className="spec-warning">{w}</p>
              ))}
            </div>
          )}
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
              <span style={{ fontSize: 15 }}>Добавить фото</span>
              <span style={{ fontSize: 12, color: 'var(--hint)' }}>
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

      {/* Server error */}
      {serverError && (
        <div className="error-msg" style={{ margin: '0 16px 8px' }}>{serverError}</div>
      )}

      {/* Navigation */}
      <div className="form-nav">
        {step > 0 && (
          <button className="btn btn-outline" onClick={goPrev} style={{ flex: 1 }}>
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
