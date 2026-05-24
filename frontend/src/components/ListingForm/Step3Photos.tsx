import { useRef } from 'react'
import type { FormData } from './types'
import './Form.css'

interface Props { data: FormData; onChange: (p: Partial<FormData>) => void }

export default function Step3Photos({ data, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const total = data.existingPhotos.length + data.newPhotoFiles.length

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const allowed = Math.max(0, 20 - total)
    onChange({ newPhotoFiles: [...data.newPhotoFiles, ...Array.from(files).slice(0, allowed)] })
  }

  return (
    <div className="form-step">
      <div className="form-group">
        <label>Фото ({total}/20)</label>
        <div className="photo-grid">
          {data.existingPhotos.map(url => (
            <div key={url} className="photo-thumb">
              <img src={url} alt="" />
              <button className="photo-remove" onClick={() => onChange({ existingPhotos: data.existingPhotos.filter(u => u !== url) })}>×</button>
            </div>
          ))}
          {data.newPhotoFiles.map((file, i) => (
            <div key={i} className="photo-thumb">
              <img src={URL.createObjectURL(file)} alt="" />
              <button className="photo-remove" onClick={() => onChange({ newPhotoFiles: data.newPhotoFiles.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          {total < 20 && <button className="photo-add" onClick={() => inputRef.current?.click()}>+</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        <p className="form-hint">Первое фото — главное. Максимум 20 штук.</p>
      </div>
      <div className="form-group">
        <label>Описание</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })} maxLength={3000} rows={6} placeholder="Опишите автомобиль..." />
        <p className="form-hint form-hint--right">{data.description.length}/3000</p>
      </div>
    </div>
  )
}
