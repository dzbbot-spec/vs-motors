interface TelegramWebApp {
  ready(): void
  expand(): void
  initData: string
  initDataUnsafe: {
    user?: { id: number; username?: string; first_name?: string }
    start_param?: string
  }
  BackButton: {
    show(): void
    hide(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
  }
  colorScheme?: 'light' | 'dark'
}

// Ленивый доступ — не кешируем на уровне модуля, берём каждый раз
function getTg(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp
}

export function ready() {
  try { getTg()?.ready() } catch { /* ignore */ }
}

export function expand() {
  try { getTg()?.expand() } catch { /* ignore */ }
}

export function getInitData(): string {
  return getTg()?.initData ?? ''
}

export function getUser() {
  return getTg()?.initDataUnsafe?.user ?? null
}

export function getStartParam(): string | undefined {
  return getTg()?.initDataUnsafe?.start_param
}

export function showBackButton(fn: () => void) {
  try {
    getTg()?.BackButton.show()
    getTg()?.BackButton.onClick(fn)
  } catch { /* ignore */ }
}

export function hideBackButton(fn: () => void) {
  try {
    getTg()?.BackButton.hide()
    getTg()?.BackButton.offClick(fn)
  } catch { /* ignore */ }
}
