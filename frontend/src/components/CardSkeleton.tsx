import './CardSkeleton.css'

export default function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton--photo" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--price" />
        <div className="skeleton skeleton--meta" />
      </div>
    </div>
  )
}
