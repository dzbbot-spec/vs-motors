import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ready, expand, getStartParam } from './lib/telegram'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AddListingPage from './pages/AddListingPage'
import EditListingPage from './pages/EditListingPage'
import AdminPage from './pages/AdminPage'
import OwnerGuard from './components/OwnerGuard'

function DeepLinkHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    const param = getStartParam()
    if (param?.startsWith('listing_')) {
      const id = param.slice('listing_'.length)
      navigate(`/listing/${id}`, { replace: true })
    }
  }, [navigate])
  return null
}

export default function App() {
  useEffect(() => {
    ready()
    expand()
  }, [])

  return (
    <>
      <DeepLinkHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/add" element={<OwnerGuard><AddListingPage /></OwnerGuard>} />
        <Route path="/listing/:id/edit" element={<OwnerGuard><EditListingPage /></OwnerGuard>} />
        <Route path="/admin" element={<OwnerGuard><AdminPage /></OwnerGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
