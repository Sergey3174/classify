import { categoryStyle } from './categoryStyle'
import type { CategoryId } from '../types'

export function CategoryIcon({ id, size = 22 }: { id: CategoryId; size?: number }) {
  const { icon: Icon, color } = categoryStyle[id]
  return <Icon size={size} color={color} strokeWidth={2} aria-hidden />
}

/** iOS settings-style solid tile with a white glyph. */
export function CategoryTile({ id, size = 26 }: { id: CategoryId; size?: number }) {
  const { icon: Icon, color } = categoryStyle[id]
  return (
    <span className="tile-icon" style={{ background: color, width: size, height: size, borderRadius: size * 0.27 }}>
      <Icon size={size * 0.6} strokeWidth={2.2} aria-hidden />
    </span>
  )
}
