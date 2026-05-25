import { getInitData } from '../lib/telegram'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options: RequestInit = {}, attempt = 0): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const initData = getInitData()
  if (initData) headers['X-Telegram-Init-Data'] = initData

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (!res.ok) {
      let detail = res.statusText
      try {
        const body = await res.json()
        if (typeof body.detail === 'string') detail = body.detail
      } catch { /* ignore */ }
      throw new Error(detail)
    }

    if (res.status === 204) return undefined as T
    return res.json()
  } catch (e) {
    if (e instanceof TypeError && attempt < 2) {
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
      return request<T>(path, options, attempt + 1)
    }
    throw e
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
