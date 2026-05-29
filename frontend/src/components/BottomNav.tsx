import { useLocation, useNavigate } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'

export default function BottomNav() {
  const { isOwner } = useTelegram()
  const { pathname } = useLocation()
  const nav = useNavigate()

  return (
    <nav className="tab-bar">
      <button
        className={`tab-item${pathname === '/' ? ' active' : ''}`}
        onClick={() => nav('/')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span>Витрина</span>
      </button>

      <button
        className={`tab-item${pathname === '/about' ? ' active' : ''}`}
        onClick={() => nav('/about')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>О салоне</span>
      </button>

      {isOwner && (
        <button
          className={`tab-item${pathname === '/admin' ? ' active' : ''}`}
          onClick={() => nav('/admin')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Управление</span>
        </button>
      )}
    </nav>
  )
}
