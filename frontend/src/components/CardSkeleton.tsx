export default function CardSkeleton() {
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
