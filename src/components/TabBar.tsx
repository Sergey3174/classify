import { Bell, Heart, House, LayoutList, Plus, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../store/useApp'
import { haptic } from '../telegram/telegram'
import { useAsync } from '../utils/useAsync'

/** Bottom navigation for the section roots (TAB_ROOTS in navigation.ts). Hidden on screens that use Telegram's MainButton. */

/**
 * Every tab has the same anatomy: a 44×28 pill with a 22px / stroke-2 icon (the same
 * size and weight as the header icons and category tiles) and an 11px label.
 * The active tab gets the tinted pill, «Подать» a solid accent pill.
 */
function Tab({ to, icon: Icon, label, badge, primary }: { to: string; icon: LucideIcon; label: string; badge?: number; primary?: boolean }) {
  return (
    <NavLink
      to={to}
      end
      replace // switching tabs must not pile up history
      className={`tabbar__item${primary ? ' tabbar__item--primary' : ''}`}
      onClick={() => (primary ? haptic.tap() : haptic.select())}
    >
      <span className="tabbar__pill">
        <Icon size={22} strokeWidth={2} />
        {!!badge && <span className="tabbar__badge num">{badge}</span>}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

export function TabBar() {
  const { favorites } = useApp()
  // refetched whenever the bar mounts again, e.g. after opening an alert (that marks matches as seen)
  const alerts = useAsync(() => api.getAlerts(), [])
  const fresh = (alerts.data ?? []).reduce((n, a) => n + a.fresh, 0)
  return (
    <nav className="tabbar" aria-label="Разделы">
      <Tab to="/" icon={House} label="Главная" />
      <Tab to="/favorites" icon={Heart} label="Избранное" badge={favorites.length} />
      <Tab to="/create" icon={Plus} label="Подать" primary />
      <Tab to="/alerts" icon={Bell} label="Уведомления" badge={fresh} />
      <Tab to="/my" icon={LayoutList} label="Мои" />
    </nav>
  )
}
