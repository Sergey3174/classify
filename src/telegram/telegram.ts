/**
 * Thin wrapper over window.Telegram.WebApp.
 * Outside Telegram (plain browser during development) every call is a safe no-op,
 * so the UI can be built and checked in Chrome without a bot.
 */

type HapticImpact = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type HapticNotification = 'error' | 'success' | 'warning'

interface TgButton {
  show(): void
  hide(): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
}

interface TgMainButton extends TgButton {
  setText(text: string): void
  enable(): void
  disable(): void
  showProgress(leaveActive?: boolean): void
  hideProgress(): void
}

interface TgWebApp {
  initData: string
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } }
  colorScheme: 'light' | 'dark'
  platform: string
  ready(): void
  expand(): void
  close(): void
  setHeaderColor?(color: string): void
  setBackgroundColor?(color: string): void
  enableClosingConfirmation?(): void
  disableClosingConfirmation?(): void
  openTelegramLink(url: string): void
  openLink(url: string): void
  showConfirm?(message: string, cb: (ok: boolean) => void): void
  BackButton: TgButton
  MainButton: TgMainButton
  HapticFeedback?: {
    impactOccurred(style: HapticImpact): void
    notificationOccurred(type: HapticNotification): void
    selectionChanged(): void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp }
  }
}

export const tg: TgWebApp | undefined = window.Telegram?.WebApp

/** True only inside a real Telegram client (initData is empty in a plain browser). */
export const isTelegram = Boolean(tg && tg.initData)

export function initTelegram() {
  if (!tg) return
  tg.ready()
  tg.expand()
  // Fragment-dark identity: paint Telegram's own header and background to match.
  tg.setHeaderColor?.('#1a2026')
  tg.setBackgroundColor?.('#1a2026')
}

export const haptic = {
  tap: () => tg?.HapticFeedback?.impactOccurred('light'),
  select: () => tg?.HapticFeedback?.selectionChanged(),
  success: () => tg?.HapticFeedback?.notificationOccurred('success'),
  error: () => tg?.HapticFeedback?.notificationOccurred('error'),
}

/** Current Telegram user, or a mock user while developing in the browser. */
export function currentTgUser() {
  return tg?.initDataUnsafe.user ?? { id: 1, first_name: 'Павел', username: 'pavel_dev' }
}

export function openTelegramChat(username: string) {
  const url = `https://t.me/${username}`
  if (isTelegram && tg) tg.openTelegramLink(url)
  else window.open(url, '_blank')
}

export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (isTelegram && tg?.showConfirm) tg.showConfirm(message, resolve)
    else resolve(window.confirm(message))
  })
}
