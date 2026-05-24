import WebApp from '@twa-dev/sdk'

export function useTelegram() {
  const user = WebApp.initDataUnsafe?.user
  const initData = WebApp.initData

  const isOwner =
    !!user && String(user.id) === import.meta.env.VITE_OWNER_TG_ID

  return { user, initData, isOwner, WebApp }
}
