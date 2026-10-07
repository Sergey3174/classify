import { Heart, House, LayoutList, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../store/app'
import { haptic } from '../telegram/telegram'

/** Bottom navigation for the section roots. Hidden on screens that use Telegram's MainButton. */
export const TAB_ROOTS = ['/', '/favorites', '/my']

export function TabBar() {
  const { favorites } = useApp()
  return (
    <nav className="tabbar" aria-label="Разделы">
      <NavLink to="/" end className="tabbar__item" onClick={() => haptic.select()}>
        <House size={22} strokeWidth={2.1} />
        <span>Главная</span>
      </NavLink>
      <NavLink to="/create" className="tabbar__item tabbar__item--create" onClick={() => haptic.tap()}>
        <span className="tabbar__plus"><Plus size={20} strokeWidth={2.6} /></span>
        <span>Подать</span>
      </NavLink>
      <NavLink to="/favorites" className="tabbar__item" onClick={() => haptic.select()}>
        <span className="tabbar__icon">
          <Heart size={22} strokeWidth={2.1} />
          {favorites.length > 0 && <span className="tabbar__badge num">{favorites.length}</span>}
        </span>
        <span>Избранное</span>
      </NavLink>
      <NavLink to="/my" className="tabbar__item" onClick={() => haptic.select()}>
        <LayoutList size={22} strokeWidth={2.1} />
        <span>Мои</span>
      </NavLink>
    </nav>
  )
}
