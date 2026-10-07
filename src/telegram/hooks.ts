import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isTelegram, tg } from './telegram'

/** Shows Telegram's native Back button on every screen except the tab roots. */
export function useTelegramBackButton(rootPaths: string[]) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const app = tg
    if (!app) return
    const isRoot = rootPaths.includes(location.pathname)
    const goBack = () => navigate(-1)
    if (isRoot) {
      app.BackButton.hide()
      return
    }
    app.BackButton.show()
    app.BackButton.onClick(goBack)
    return () => app.BackButton.offClick(goBack)
  }, [location.pathname, navigate, rootPaths])
}

/**
 * Telegram's native bottom MainButton. In a plain browser the page renders its own
 * fallback button instead (see <MainAction/>), so `isTelegram` is returned for that.
 */
export function useMainButton(text: string | null, onClick: () => void, opts: { disabled?: boolean; loading?: boolean } = {}) {
  const handler = useRef(onClick)
  handler.current = onClick

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
