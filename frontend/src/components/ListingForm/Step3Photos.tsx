import { useRef } from 'react'
import type { FormData } from './types'
import './Form.css'

interface Props {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}

export default function Step3Photos({ data, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const totalPhotos = data.existingPhotos.length + data.newPhotoFiles.length

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const allowed = 20 - totalPhotos
    if (allowed <= 0) return
    const added = Array.from(files).slice(0, allowed)
    onChange({ newPhotoFiles: [...data.newPhotoFiles, ...added] })
  }

  const removeExisting = (url: string) => {
    onChange({ existingPhotos: data.existingPhotos.filter(u => u !== url) })
  }

  const removeNew = (idx: number) => {
    onChange({ newPhotoFiles: data.newPhotoFiles.filter((_, i) => i !== idx) })
  }

  return (
    <div className="form-step">
      <div className="form-group">
        <label>Фото ({totalPhotos}/20)</label>

        <div className="photo-grid">
          {data.existingPhotos.map(url => (
            <div key={url} className="photo-thumb">
              <img src={url} alt="" />
              <button className="photo-remove" onClick={() => removeExisting(url)}>×</button>
            </div>
          ))}
          {data.newPhotoFiles.map((file, i) => (
            <div key={i} className="photo-thumb">
              <img src={URL.createObjectURL(file)} alt="" />
              <button className="photo-remove" onClick={() => removeNew(i)}>×</button>
            </div>
          ))}
          {totalPhotos < 20 && (
            <button className="photo-add" onClick={() => inputRef.current?.click()}>
              +
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <p className="form-hint">Первое фото — главное. Максимум 20 штук, до 10 МБ каждое.</p>
      </div>

      <div className="form-group">
        <label>Описание</label>
        <textarea
          value={data.description}
          onChange={e => onChange({ description: e.target.value })}
          maxLength={3000}
          rows={6}
          placeholder="Опишите автомобиль: комплектация, состояние, история..."
        />
        <p className="form-hint form-hint--right">{data.description.length}/3000</p>
      </div>
    </div>
  )
}
