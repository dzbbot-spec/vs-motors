import './CardSkeleton.css'

export default function CardSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton__photo" />
      <div className="skeleton__body">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__line skeleton__line--price" />
        <div className="skeleton__line skeleton__line--meta" />
      </div>
    </div>
  )
}
