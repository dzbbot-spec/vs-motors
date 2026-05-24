interface TgWebApp {
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
}

function tg(): TgWebApp | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
}

export const ready = () => { try { tg()?.ready() } catch { /* ignore */ } }
export const expand = () => { try { tg()?.expand() } catch { /* ignore */ } }
export const getInitData = (): string => tg()?.initData ?? ''
export const getUser = () => tg()?.initDataUnsafe?.user ?? null
export const getStartParam = (): string | undefined => tg()?.initDataUnsafe?.start_param

export function showBackButton(fn: () => void) {
  try { tg()?.BackButton.show(); tg()?.BackButton.onClick(fn) } catch { /* ignore */ }
}

export function hideBackButton(fn: () => void) {
  try { tg()?.BackButton.hide(); tg()?.BackButton.offClick(fn) } catch { /* ignore */ }
}
