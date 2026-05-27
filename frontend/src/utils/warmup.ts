// Пинг бэкенда чтобы не засыпал (Render Free tier)
export function warmupBackend() {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', '/health', true)
  xhr.timeout = 10000
  xhr.send()
}
