import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * «Назад» по экранам приложения, а не по истории браузера.
 *
 * - Корень раздела таб-бара (Главная, Избранное, Уведомления, Мои) начинает путь заново.
 * - «Назад» возвращает на экран, с которого пришли.
 * - В пути не бывает двух экранов одного вида: если из профиля продавца открыть другое
 *   объявление, прежнее объявление из пути выпадает. Путь «Главная → профиль → объявление»
 *   остаётся, а цепочки «объявление → профиль → объявление → профиль…» не возникает —
 *   «назад» не водит по чужим профилям.
 * - Экран, открытый по прямой ссылке (пути нет), ведёт на свой родительский раздел.
 */

export const TAB_ROOTS = ['/', '/favorites', '/alerts', '/my']

type Kind = 'root' | 'listing' | 'user' | 'search' | 'create' | 'me' | 'kyc' | 'rules' | 'alert'

function kindOf(pathname: string): Kind {
  if (TAB_ROOTS.includes(pathname)) return 'root'
  if (pathname.startsWith('/listing/')) return 'listing'
  if (pathname.startsWith('/user/')) return 'user'
  if (pathname.startsWith('/alerts/')) return 'alert'
  if (pathname === '/search') return 'search'
  if (pathname === '/create') return 'create'
  if (pathname === '/kyc') return 'kyc'
  if (pathname === '/rules') return 'rules'
  return 'me'
}

/** Parent screen when there is no path (opened by a direct link or after a reload). */
function fallbackParent(pathname: string) {
  switch (kindOf(pathname)) {
    case 'alert':
      return '/alerts'
    case 'kyc':
    case 'rules':
      return '/me'
    default:
      return '/'
  }
}

const pathOf = (pathname: string) => pathname.split('?')[0]

let stack: string[] = []

/** Called on every location change (once, in the app shell). */
function track(path: string) {
  const pathname = pathOf(path)
  const kind = kindOf(pathname)
  if (kind === 'root') {
    stack = [path]
    return
  }
  // went back to the previous screen
  if (stack.length > 1 && stack[stack.length - 2] === path) {
    stack = stack.slice(0, -1)
    return
  }
  if (stack[stack.length - 1] === path) return
  // at most one screen of each kind in the path: the older one drops out
  stack = [...stack.filter((p) => kindOf(pathOf(p)) !== kind), path]
}

export function useNavTracking() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    track(pathname + search)
  }, [pathname, search])
}

/** A screen may take over «Назад» (the create wizard steps back instead of leaving). */
let backOverride: (() => void) | null = null

export function useBackHandler(handler: () => void) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    backOverride = () => ref.current()
    return () => {
      backOverride = null
    }
  }, [])
}

/** «Назад» for both the in-app «‹» and Telegram's native BackButton. */
export function useGoBack() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return useCallback(
    (opts: { ignoreOverride?: boolean } = {}) => {
      if (backOverride && !opts.ignoreOverride) return backOverride()
      if (stack.length > 1) return navigate(stack[stack.length - 2], { replace: true })
      stack = [] // no path: start a fresh one from the parent
      navigate(fallbackParent(pathname), { replace: true })
    },
    [navigate, pathname],
  )
}
