import type { FormData } from './types'
import './Form.css'

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void }

export default function Step1Basic({ data, onChange }: Props) {
  return (
    <div className="form-step">
      <div className="form-group">
        <label>Марка *</label>
        <input value={data.brand} onChange={e => onChange({ brand: e.target.value })} placeholder="Toyota" />
      </div>
      <div className="form-group">
        <label>Модель *</label>
        <input value={data.model} onChange={e => onChange({ model: e.target.value })} placeholder="Camry" />
      </div>
      <div className="form-group">
        <label>Год *</label>
        <input type="number" value={data.year} onChange={e => onChange({ year: e.target.value })} placeholder="2020" min="1900" max="2100" />
      </div>
      <div className="form-group">
        <label>Цена *</label>
        <div className="form-row">
          <input type="number" value={data.price} onChange={e => onChange({ price: e.target.value })} placeholder="15000" style={{ flex: 1 }} />
          <select value={data.currency} onChange={e => onChange({ currency: e.target.value as 'USD' | 'ILS' })}>
            <option value="USD">USD</option>
            <option value="ILS">ILS</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Статус</label>
        <select value={data.status} onChange={e => onChange({ status: e.target.value as 'active' | 'sold' })}>
          <option value="active">Продаётся</option>
          <option value="sold">Продан</option>
        </select>
      </div>
    </div>
  )
}
