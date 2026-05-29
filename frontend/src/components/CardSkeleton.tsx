interface Props {
  layout?: 'horizontal' | 'vertical'
}

export default function CardSkeleton({ layout = 'vertical' }: Props) {
  const isGrid = layout === 'vertical'
  const cls = ['listing-card', isGrid ? 'listing-card--grid' : ''].filter(Boolean).join(' ')

  return (
    <div className={cls} style={{ pointerEvents: 'none' }}>
      <div
        className="listing-card__photo skeleton-box"
        style={{ borderRadius: 0 }}
      />
      <div className="listing-card__body">
        <div className="skeleton-line" style={{ width: '65%', height: 16, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '80%', height: 12, marginBottom: 12 }} />
        <div className="skeleton-line" style={{ width: '45%', height: 20 }} />
      </div>
    </div>
  )
}
