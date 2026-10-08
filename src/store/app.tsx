import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { haptic } from '../telegram/telegram'
import { FirstLocation } from '../pages/FirstLocation'
import { Ctx, type AppState, type Location } from './useApp'

/** Per-device UI state. In production favorites and location would sync via the API / Telegram CloudStorage. */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode) — state stays in memory */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // null on the very first launch: the place is detected by IP (or chosen) before anything else is shown
  const [location, setLoc] = useState<Location | null>(() => load<Location | null>('classify.location', null))
  const [favorites, setFavs] = useState<string[]>(() => load('classify.favorites', ['l1', 'l9']))
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const setLocation = useCallback((l: Location) => {
    setLoc(l)
    save('classify.location', l)
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    haptic.tap()
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
      save('classify.favorites', next)
      return next
    })
  }, [])

  const showToast = useCallback((text: string) => {
    setToast(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  const value = useMemo<AppState>(
    () => ({
      location: location ?? { cityId: '', district: null }, // only read once a place is set (see below)
      setLocation,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      toast,
      showToast,
    }),
    [location, setLocation, favorites, toggleFavorite, toast, showToast],
  )

  return <Ctx.Provider value={value}>{location ? children : <FirstLocation onDone={setLocation} />}</Ctx.Provider>
}
