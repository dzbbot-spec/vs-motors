// Автодополнение марки и модели с валидацией
import { useState, useRef, useEffect } from 'react'
import { CAR_DATABASE, type CarModel } from '../data/cars'
import './BrandModelSelect.css'

interface Props {
  brand: string
  model: string
  onBrandChange: (brand: string) => void
  onModelChange: (model: string, spec?: CarModel) => void
}

export default function BrandModelSelect({ brand, model, onBrandChange, onModelChange }: Props) {
  const [brandQuery, setBrandQuery] = useState(brand)
  const [modelQuery, setModelQuery] = useState(model)
  const [showBrands, setShowBrands] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const brandRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)

  const filteredBrands = CAR_DATABASE.filter(b =>
    b.name.toLowerCase().startsWith(brandQuery.toLowerCase())
  ).slice(0, 8)

  const selectedBrand = CAR_DATABASE.find(b =>
    b.name.toLowerCase() === brandQuery.toLowerCase()
  )
  const filteredModels = selectedBrand
    ? selectedBrand.models.filter(m =>
        m.name.toLowerCase().startsWith(modelQuery.toLowerCase())
      ).slice(0, 8)
    : []

  // Закрытие по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) setShowBrands(false)
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModels(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectBrand = (name: string) => {
    setBrandQuery(name)
    setModelQuery('')
    setShowBrands(false)
    onBrandChange(name)
  }

  const selectModel = (m: CarModel) => {
    setModelQuery(m.name)
    setShowModels(false)
    onModelChange(m.name, m)
  }

  return (
    <div className="bms-wrap">
      {/* Марка */}
      <div className="bms-field" ref={brandRef}>
        <label className="bms-label">Марка</label>
        <input
          className="bms-input"
          value={brandQuery}
          placeholder="Toyota, BMW, Lada..."
          onChange={e => { setBrandQuery(e.target.value); setShowBrands(true) }}
          onFocus={() => setShowBrands(true)}
          // Синхронизируем введённое значение с формой при потере фокуса
          onBlur={() => { if (brandQuery !== brand) onBrandChange(brandQuery) }}
        />
        {showBrands && filteredBrands.length > 0 && (
          <div className="bms-dropdown">
            {filteredBrands.map(b => (
              <button key={b.name} className="bms-option" onMouseDown={() => selectBrand(b.name)}>
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Модель — только если марка выбрана */}
      <div className="bms-field" ref={modelRef}>
        <label className="bms-label">Модель</label>
        <input
          className={`bms-input${!selectedBrand ? ' bms-input--disabled' : ''}`}
          value={modelQuery}
          placeholder={selectedBrand ? `Выберите модель ${brandQuery}` : 'Сначала выберите марку'}
          disabled={!selectedBrand}
          onChange={e => { setModelQuery(e.target.value); setShowModels(true) }}
          onFocus={() => setShowModels(true)}
          // Синхронизируем введённое значение с формой при потере фокуса
          onBlur={() => { if (modelQuery !== model) onModelChange(modelQuery) }}
        />
        {showModels && filteredModels.length > 0 && (
          <div className="bms-dropdown">
            {filteredModels.map(m => (
              <button key={m.name} className="bms-option" onMouseDown={() => selectModel(m)}>
                <span className="bms-option__name">{m.name}</span>
                <span className="bms-option__hint">{m.engines.join(', ')} л · до {m.power[1]} л.с.</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
