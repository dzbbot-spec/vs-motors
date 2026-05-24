import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AddListingPage from './pages/AddListingPage'
import EditListingPage from './pages/EditListingPage'
import AdminPage from './pages/AdminPage'
import OwnerGuard from './components/OwnerGuard'

export default function App() {
  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/add" element={<OwnerGuard><AddListingPage /></OwnerGuard>} />
      <Route path="/listing/:id/edit" element={<OwnerGuard><EditListingPage /></OwnerGuard>} />
      <Route path="/admin" element={<OwnerGuard><AdminPage /></OwnerGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
