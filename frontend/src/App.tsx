import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ready, expand, getStartParam } from './lib/telegram'
import { useTelegram } from './hooks/useTelegram'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AddListingPage from './pages/AddListingPage'
import EditListingPage from './pages/EditListingPage'
import AdminPage from './pages/AdminPage'

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { isOwner } = useTelegram()
  if (!isOwner) return <Navigate to="/" replace />
  return <>{children}</>
}

function DeepLinkHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    const param = getStartParam()
    if (param?.startsWith('listing_')) {
      navigate(`/listing/${param.slice('listing_'.length)}`, { replace: true })
    }
  }, [navigate])
  return null
}

export default function App() {
  useEffect(() => { ready(); expand() }, [])

  return (
    <>
      <DeepLinkHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/add" element={<OwnerRoute><AddListingPage /></OwnerRoute>} />
        <Route path="/listing/:id/edit" element={<OwnerRoute><EditListingPage /></OwnerRoute>} />
        <Route path="/admin" element={<OwnerRoute><AdminPage /></OwnerRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
