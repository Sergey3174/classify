import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { TAB_ROOTS, useGoBack } from '../navigation'
import { isTelegram, tg } from './telegram'

/** Shows Telegram's native Back button on every screen except the tab roots; it does the same as «‹». */
export function useTelegramBackButton() {
  const { pathname } = useLocation()
  const goBack = useGoBack()

  useEffect(() => {
    const app = tg
    if (!app) return
    if (TAB_ROOTS.includes(pathname)) {
      app.BackButton.hide()
      return
    }
    const onClick = () => goBack()
    app.BackButton.show()
    app.BackButton.onClick(onClick)
    return () => app.BackButton.offClick(onClick)
  }, [pathname, goBack])
}

/**
 * Telegram's native bottom MainButton. In a plain browser the page renders its own
 * fallback button instead (see <MainAction/>), so `isTelegram` is returned for that.
 */
export function useMainButton(text: string | null, onClick: () => void, opts: { disabled?: boolean; loading?: boolean } = {}) {
  const handler = useRef(onClick)
  useEffect(() => {
    handler.current = onClick
  })

  useEffect(() => {
    if (!tg || !isTelegram) return
    const mb = tg.MainButton
    if (!text) {
      mb.hide()
      return
    }
    const cb = () => handler.current()
    mb.setText(text)
    if (opts.disabled) mb.disable()
    else mb.enable()
    if (opts.loading) mb.showProgress()
    else mb.hideProgress()
    mb.show()
    mb.onClick(cb)
    return () => {
      mb.offClick(cb)
      mb.hide()
    }
  }, [text, opts.disabled, opts.loading])

  return isTelegram
}
