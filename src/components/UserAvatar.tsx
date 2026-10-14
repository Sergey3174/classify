import { UserRound } from 'lucide-react'
import { useState } from 'react'

export function UserAvatar({ src, size }: { src?: string; size: number }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (src && src !== failedSrc) {
    return <img className="avatar" src={src} alt="" width={size} height={size} onError={() => setFailedSrc(src)} />
  }
  return (
    <span className="avatar" aria-hidden="true" style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tile-gray)', color: 'var(--hint)', flexShrink: 0 }}>
      <UserRound size={size * 0.6} />
    </span>
  )
}
