import {
  Baby,
  BriefcaseBusiness,
  Car,
  Guitar,
  House,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../types'

const map: Record<CategoryId, { icon: LucideIcon; color: string }> = {
  realty: { icon: House, color: '#007aff' },
  transport: { icon: Car, color: '#ff8a00' },
  electronics: { icon: Smartphone, color: '#5856d6' },
  services: { icon: Wrench, color: '#18a957' },
  home: { icon: Sofa, color: '#ff2d55' },
  jobs: { icon: BriefcaseBusiness, color: '#5b6b7f' },
  clothes: { icon: Shirt, color: '#e0a100' },
  kids: { icon: Baby, color: '#00a5c8' },
  hobby: { icon: Guitar, color: '#9b51e0' },
  pets: { icon: PawPrint, color: '#f2622e' },
}

export const categoryColor = (id: CategoryId) => map[id].color

export function CategoryIcon({ id, size = 22 }: { id: CategoryId; size?: number }) {
  const { icon: Icon, color } = map[id]
  return <Icon size={size} color={color} strokeWidth={2} aria-hidden />
}

/** iOS settings-style solid tile with a white glyph. */
export function CategoryTile({ id, size = 26 }: { id: CategoryId; size?: number }) {
  const { icon: Icon, color } = map[id]
  return (
    <span className="tile-icon" style={{ background: color, width: size, height: size, borderRadius: size * 0.27 }}>
      <Icon size={size * 0.6} strokeWidth={2.2} aria-hidden />
    </span>
  )
}
