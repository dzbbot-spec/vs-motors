import { useState, useRef, useCallback } from 'react'

interface Props {
  photos: string[]
  alt?: string
}

export default function PhotoGallery({ photos, alt = 'Фото' }: Props) {
  const [idx, setIdx] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setIdx(i)
  }, [])

  const goTo = (i: number) => {
    const el = stripRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
    setIdx(i)
  }

  if (photos.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery__empty">Нет фотографий</div>
      </div>
    )
  }

  return (
    <div className="gallery">
      <div className="gallery__strip" ref={stripRef} onScroll={handleScroll}>
        {photos.map((url, i) => (
          <div key={i} className="gallery__slide">
            <img src={url} alt={`${alt} ${i + 1}`} />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="gallery__dots">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`gallery__dot${i === idx ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Фото ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
