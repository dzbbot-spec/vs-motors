import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'

export function useBackButton() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])

  useEffect(() => {
    try {
      WebApp.BackButton.show()
      WebApp.BackButton.onClick(goBack)
    } catch {
      // BackButton недоступен в этой версии Telegram
    }
    return () => {
      try {
        WebApp.BackButton.hide()
        WebApp.BackButton.offClick(goBack)
      } catch {
        // ignore
      }
    }
  }, [goBack])
}
