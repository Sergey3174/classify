import { createContext, useContext } from 'react'

/** App state contract and its hook; the provider lives in ./app.tsx (kept apart for React Fast Refresh). */

export interface Location {
  cityId: string
  district: string | null // null = весь город
  /** auto = определили по IP (только город); manual = человек выбрал сам — автоопределение его не перезаписывает */
  source?: 'auto' | 'manual'
}

export interface AppState {
  location: Location
  setLocation(l: Location): void
  favorites: string[]
  isFavorite(id: string): boolean
  toggleFavorite(id: string): void
  toast: string | null
  showToast(text: string): void
}

export const Ctx = createContext<AppState | null>(null)

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside <AppProvider>')
  return v
}
