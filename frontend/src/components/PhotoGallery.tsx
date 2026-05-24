import { useState, useRef } from 'react'
import './PhotoGallery.css'

interface Props {
  photos: string[]
  alt: string
}

export default function PhotoGallery({ photos, alt }: Props) {
  const [index, setIndex] = useState(0)
  const startX = useRef(0)

  if (photos.length === 0) {
    return (
      <div className="gallery gallery--empty">
        <span>🚗</span>
      </div>
    )
  }

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(photos.length - 1, i + 1))

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = startX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  return (
    <div className="gallery">
      <div
        className="gallery__track"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {photos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} — фото ${i + 1}`}
            className="gallery__img"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="gallery__dots">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`gallery__dot${i === index ? ' gallery__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Фото ${i + 1}`}
            />
          ))}
        </div>
      )}

      {photos.length > 1 && (
        <div className="gallery__counter">{index + 1} / {photos.length}</div>
      )}
    </div>
  )
}
