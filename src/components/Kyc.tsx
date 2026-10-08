import { BadgeCheck } from 'lucide-react'
import type { User } from '../types'

/** Blue check next to a name — only for users who passed KYC. Unverified users get nothing. */
export function KycMark({ user, size = 15 }: { user: Pick<User, 'kyc'>; size?: number }) {
  if (user.kyc !== 'verified') return null
  return (
    <BadgeCheck
      size={size}
      color="var(--accent)"
      fill="var(--accent-soft)"
      role="img"
      aria-label="Личность подтверждена (KYC)"
      style={{ flex: 'none' }}
    />
  )
}
