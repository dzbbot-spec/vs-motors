import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AddListingPage from './pages/AddListingPage'
import EditListingPage from './pages/EditListingPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  useEffect(() => {
    WebApp.ready()
    WebApp.expand()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/listing/:id" element={<ListingDetailPage />} />
      <Route path="/add" element={<AddListingPage />} />
      <Route path="/listing/:id/edit" element={<EditListingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
