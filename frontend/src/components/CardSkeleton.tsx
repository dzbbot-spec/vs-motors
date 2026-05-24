export default function CardSkeleton() {
  return (
    <div className="car-card" style={{ pointerEvents: 'none' }}>
      <div className="car-card__photo skeleton-box" style={{ borderRadius: 8 }} />
      <div className="car-card__info">
        <div className="skeleton-line" style={{ width: '65%', height: 18, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '45%', height: 14, marginBottom: 16 }} />
        <div className="skeleton-line" style={{ width: '38%', height: 20 }} />
      </div>
    </div>
  )
}
