import { ChevronLeft, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/app'
import { useMainButton } from '../telegram/hooks'
import { isTelegram } from '../telegram/telegram'

/**
 * Inside Telegram the native header + BackButton are used, so this renders nothing.
 * In a plain browser it imitates Telegram's header so screens can be reviewed in Chrome.
 */
export function TopBar({ title, plain }: { title?: string; plain?: boolean }) {
  const navigate = useNavigate()
  if (isTelegram) return null
  return (
    <div className={`devbar${plain ? ' devbar--plain' : ''}`}>
      <button type="button" className="devbar__back" onClick={() => navigate(-1)}>
        <ChevronLeft size={22} strokeWidth={2.4} /> Назад
      </button>
      {title && <div className="devbar__title">{title}</div>}
    </div>
  )
}

/**
 * Telegram MainButton. Inside Telegram the native button is driven via the SDK;
 * in the browser a look-alike sticky button is rendered instead.
 */
export function MainAction({
  text,
  onClick,
  disabled,
  loading,
  grouped,
  secondary,
}: {
  text: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  grouped?: boolean
  secondary?: ReactNode
}) {
  const native = useMainButton(text, onClick, { disabled, loading })
  if (native && !secondary) return null
  return (
    <div className={`main-action${grouped ? ' main-action--grouped' : ''}`}>
      {secondary}
      {!native && (
        <button type="button" className="btn btn--primary btn--block" disabled={disabled || loading} onClick={onClick}>
          {loading ? 'Подождите…' : text}
        </button>
      )}
    </div>
  )
}

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return (
    <div className="toast" role="status">
      <CircleCheck size={16} color="var(--success)" strokeWidth={2.4} />
      {toast}
    </div>
  )
}

export function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <div className="t-title3">{title}</div>
      <div className="t-sub hint" style={{ maxWidth: 280 }}>{text}</div>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange(v: boolean): void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange(v: T): void
}) {
  return (
    <div className="segmented" role="group">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
