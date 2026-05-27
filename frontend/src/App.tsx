import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ready, expand, getStartParam } from './lib/telegram'
import { useTelegram } from './hooks/useTelegram'
import { warmupBackend } from './utils/warmup'
import HomePage from './pages/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AddListingPage from './pages/AddListingPage'
import EditListingPage from './pages/EditListingPage'
import AdminPage from './pages/AdminPage'

function DeepLinkHandler() {
  const nav = useNavigate()
  useEffect(() => {
    const param = getStartParam()
    if (param?.startsWith('listing_')) {
      nav(`/listing/${param.replace('listing_', '')}`, { replace: true })
    }
  }, [nav])
  return null
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { isOwner } = useTelegram()
  if (!isOwner) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#ef4444', fontSize: 15 }}>
        Доступ запрещён
      </div>
    )
  }
  return <>{children}</>
}

export default function App() {
  useEffect(() => {
    ready()
    expand()
    // Первый прогрев сразу при старте
    warmupBackend()
    // Повторный пинг каждые 10 минут пока приложение открыто
    const interval = setInterval(warmupBackend, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <DeepLinkHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/add" element={<OwnerRoute><AddListingPage /></OwnerRoute>} />
        <Route path="/listing/:id/edit" element={<OwnerRoute><EditListingPage /></OwnerRoute>} />
        <Route path="/admin" element={<OwnerRoute><AdminPage /></OwnerRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
