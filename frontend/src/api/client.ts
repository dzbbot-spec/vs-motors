import { getInitData } from '../lib/telegram'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

function xhrRequest<T>(method: string, path: string, body?: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${BASE_URL}${path}`)
    xhr.setRequestHeader('Content-Type', 'application/json')
    const initData = getInitData()
    if (initData) xhr.setRequestHeader('X-Telegram-Init-Data', initData)
    xhr.timeout = 50000

    xhr.onload = () => {
      if (xhr.status === 204) { resolve(undefined as T); return }
      let data: unknown
      try { data = JSON.parse(xhr.responseText) } catch { data = null }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T)
      } else {
        const detail = (data && typeof data === 'object' && 'detail' in data)
          ? String((data as { detail: unknown }).detail)
          : null
        reject(new Error(detail ?? `[${xhr.status}] ${xhr.responseText.slice(0, 120)}`))
      }
    }
    xhr.onerror = () => reject(new Error('Сетевая ошибка'))
    xhr.ontimeout = () => reject(new Error('Время ожидания истекло'))
    xhr.send(body ?? null)
  })
}

export const api = {
  get: <T>(path: string) => xhrRequest<T>('GET', path),
  post: <T>(path: string, body: unknown) =>
    xhrRequest<T>('POST', path, JSON.stringify(body)),
  patch: <T>(path: string, body: unknown) =>
    xhrRequest<T>('PATCH', path, JSON.stringify(body)),
  delete: <T>(path: string) =>
    xhrRequest<T>('DELETE', path),
}
