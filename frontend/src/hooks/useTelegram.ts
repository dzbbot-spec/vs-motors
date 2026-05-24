import { useState, useEffect } from 'react'
import { getUser, getInitData } from '../lib/telegram'

export function useTelegram() {
  const [user, setUser] = useState(getUser)
  const [initData, setInitData] = useState(getInitData)

  useEffect(() => {
    const u = getUser()
    const d = getInitData()
    if (u) setUser(u)
    if (d) setInitData(d)
  }, [])

  const isOwner = !!user && String(user.id) === import.meta.env.VITE_OWNER_TG_ID
  return { user, initData, isOwner }
}
