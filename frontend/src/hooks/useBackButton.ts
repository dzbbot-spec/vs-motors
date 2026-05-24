import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'

export function useBackButton() {
  const navigate = useNavigate()
  useEffect(() => {
    WebApp.BackButton.show()
    WebApp.BackButton.onClick(() => navigate(-1))
    return () => {
      WebApp.BackButton.hide()
      WebApp.BackButton.offClick(() => navigate(-1))
    }
  }, [navigate])
}
