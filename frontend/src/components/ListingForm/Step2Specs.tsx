import { FormData } from './types'
import './Form.css'

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}

export default function Step2Specs({ data, onChange }: Props) {
  return (
    <div className="form-step">
      <div className="form-group">
        <label>Пробег (км)</label>
        <input
          type="number"
          value={data.mileage}
          onChange={e => onChange({ mileage: e.target.value })}
          placeholder="120000"
          min={0}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>КПП</label>
          <select value={data.transmission} onChange={e => onChange({ transmission: e.target.value })}>
            <option value="">—</option>
            <option value="AUTO">Автомат</option>
            <option value="MANUAL">Механика</option>
            <option value="CVT">Вариатор</option>
            <option value="ROBOT">Робот</option>
          </select>
        </div>
        <div className="form-group">
          <label>Топливо</label>
          <select value={data.fuel_type} onChange={e => onChange({ fuel_type: e.target.value })}>
            <option value="">—</option>
            <option value="PETROL">Бензин</option>
            <option value="DIESEL">Дизель</option>
            <option value="HYBRID">Гибрид</option>
            <option value="ELECTRIC">Электро</option>
            <option value="GAS">Газ</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Тип кузова</label>
          <select value={data.body_type} onChange={e => onChange({ body_type: e.target.value })}>
            <option value="">—</option>
            <option value="SEDAN">Седан</option>
            <option value="HATCHBACK">Хэтчбек</option>
            <option value="SUV">Внедорожник</option>
            <option value="MINIVAN">Минивэн</option>
            <option value="COUPE">Купе</option>
            <option value="WAGON">Универсал</option>
            <option value="CONVERTIBLE">Кабриолет</option>
            <option value="PICKUP">Пикап</option>
          </select>
        </div>
        <div className="form-group">
          <label>Привод</label>
          <select value={data.drive_type} onChange={e => onChange({ drive_type: e.target.value })}>
            <option value="">—</option>
            <option value="FWD">Передний</option>
            <option value="RWD">Задний</option>
            <option value="AWD">Полный</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Объём (л)</label>
          <input
            type="number"
            value={data.engine_volume}
            onChange={e => onChange({ engine_volume: e.target.value })}
            placeholder="2.0"
            step="0.1"
            min={0}
          />
        </div>
        <div className="form-group">
          <label>Мощность (л.с.)</label>
          <input
            type="number"
            value={data.power_hp}
            onChange={e => onChange({ power_hp: e.target.value })}
            placeholder="150"
            min={0}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Цвет</label>
        <input
          value={data.color}
          onChange={e => onChange({ color: e.target.value })}
          placeholder="Белый"
        />
      </div>

      <div className="form-group">
        <label>VIN (необязательно)</label>
        <input
          value={data.vin}
          onChange={e => onChange({ vin: e.target.value })}
          placeholder="JT..."
        />
      </div>

      <div className="form-group">
        <label>Страна сборки (необязательно)</label>
        <input
          value={data.country}
          onChange={e => onChange({ country: e.target.value })}
          placeholder="Япония"
        />
      </div>
    </div>
  )
}
