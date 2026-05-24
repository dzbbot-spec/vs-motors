import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { ListingFull } from '../types'
import ListingForm from '../components/ListingForm'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ListingFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ListingFull>(`/api/listings/${id}`)
      .then(setListing)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', color: 'var(--tg-hint)' }}>
      Загрузка...
    </div>
  )
  if (!listing) return null

  return <ListingForm initial={listing} />
}
