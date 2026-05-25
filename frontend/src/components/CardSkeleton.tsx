interface Props {
  layout?: 'horizontal' | 'vertical'
}

export default function CardSkeleton({ layout = 'vertical' }: Props) {
  if (layout === 'horizontal') {
    return (
      <div className="car-card car-card--horizontal" style={{ pointerEvents: 'none' }}>
        <div className="car-card__photo skeleton-box" style={{ borderRadius: 0, width: '38%', minHeight: 110 }} />
        <div className="car-card__body">
          <div className="skeleton-line" style={{ width: '70%', height: 16, marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: '55%', height: 12, marginBottom: 12 }} />
          <div className="skeleton-line" style={{ width: '40%', height: 18 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="car-card" style={{ pointerEvents: 'none' }}>
      <div className="car-card__photo skeleton-box" style={{ borderRadius: 0 }} />
      <div className="car-card__body">
        <div className="skeleton-line" style={{ width: '60%', height: 18, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '45%', height: 14, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: '35%', height: 20 }} />
      </div>
    </div>
  )
}
