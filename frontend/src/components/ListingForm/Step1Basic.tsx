import type { FormData } from './types'
import './Form.css'

const BRANDS = [
  'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
  'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Lexus', 'Mitsubishi',
  'Ford', 'Chevrolet', 'Skoda', 'Volvo', 'Porsche', 'Land Rover', 'Jeep',
]

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}

export default function Step1Basic({ data, onChange }: Props) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="form-step">
      <div className="form-group">
        <label>Марка *</label>
        <input
          list="brands-list"
          value={data.brand}
          onChange={e => onChange({ brand: e.target.value })}
          placeholder="Toyota"
        />
        <datalist id="brands-list">
          {BRANDS.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="form-group">
        <label>Модель *</label>
        <input
          value={data.model}
          onChange={e => onChange({ model: e.target.value })}
          placeholder="Camry"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Год *</label>
          <input
            type="number"
            value={data.year}
            onChange={e => onChange({ year: e.target.value })}
            min={1900}
            max={currentYear}
            placeholder={String(currentYear)}
          />
        </div>
        <div className="form-group">
          <label>Цена *</label>
          <div className="form-input-group">
            <input
              type="number"
              value={data.price}
              onChange={e => onChange({ price: e.target.value })}
              placeholder="15000"
              min={0}
            />
            <select
              value={data.currency}
              onChange={e => onChange({ currency: e.target.value as 'USD' | 'ILS' })}
            >
              <option value="USD">USD</option>
              <option value="ILS">ILS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Статус</label>
        <div className="form-radio-group">
          {(['active', 'sold'] as const).map(s => (
            <label key={s} className={`form-radio${data.status === s ? ' form-radio--active' : ''}`}>
              <input
                type="radio"
                name="status"
                value={s}
                checked={data.status === s}
                onChange={() => onChange({ status: s })}
              />
              {s === 'active' ? 'Продаётся' : 'Продан'}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
