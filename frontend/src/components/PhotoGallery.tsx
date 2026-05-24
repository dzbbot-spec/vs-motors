import { useState, useCallback } from 'react'

interface Props {
  photos: string[]
  alt?: string
}

export default function PhotoGallery({ photos, alt = 'Фото' }: Props) {
  const [idx, setIdx] = useState(0)

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  if (photos.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery__empty">
          <span>🚗</span>
          <span>Нет фотографий</span>
        </div>
      </div>
    )
  }

  return (
    <div className="gallery">
      <img
        src={photos[idx]}
        alt={`${alt} ${idx + 1}`}
        className="gallery__main"
      />

      {photos.length > 1 && (
        <>
          <button
            className="gallery__arrow gallery__arrow--prev"
            onClick={prev}
            disabled={idx === 0}
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            className="gallery__arrow gallery__arrow--next"
            onClick={next}
            disabled={idx === photos.length - 1}
            aria-label="Следующее фото"
          >
            ›
          </button>
          <div className="gallery__dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`gallery__dot ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <span className="gallery__counter">{idx + 1} / {photos.length}</span>
    </div>
  )
}
