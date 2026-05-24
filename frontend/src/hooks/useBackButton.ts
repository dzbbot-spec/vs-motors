import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { showBackButton, hideBackButton } from '../lib/telegram'

export function useBackButton() {
  const navigate = useNavigate()
  const goBack = useCallback(() => navigate(-1), [navigate])
  useEffect(() => {
    showBackButton(goBack)
    return () => hideBackButton(goBack)
  }, [goBack])
}
