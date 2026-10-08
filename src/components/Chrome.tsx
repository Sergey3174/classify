import { ChevronLeft, CircleCheck } from 'lucide-react'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useGoBack } from '../navigation'
import { ME_ID, userById } from '../mocks/users'
import { useApp } from '../store/useApp'
import { useMainButton } from '../telegram/hooks'
import { isTelegram } from '../telegram/telegram'

/**
 * The only header in the app: 52px, sticky, 40px side slots, centred 16/700 title with an
 * optional 11px hint line. Tab sections show the profile avatar on the left; nested screens
 * pass `back` and get a «‹» (only in a browser — inside Telegram the native BackButton is used).
 */
export function AppBar({
  title,
  sub,
  center,
  back,
  right,
  flush,
}: {
  title?: ReactNode
  sub?: ReactNode
  center?: ReactNode
  /** Nested screen: show «‹» instead of the avatar. `true` = app «Назад» (see navigation.ts), or a custom handler. */
  back?: boolean | (() => void)
  right?: ReactNode
  /** No gap below the bar (content such as a photo gallery starts right under it). */
  flush?: boolean
}) {
  return (
    <header className={`appbar${flush ? ' appbar--flush' : ''}`}>
      <div className="appbar__side">{back ? <BackLink onBack={back === true ? undefined : back} /> : <ProfileLink />}</div>
      {center ?? (
        <div className="appbar__center">
          <h1 className="appbar__title">{title}</h1>
          {sub && <span className="appbar__sub num">{sub}</span>}
        </div>
      )}
      <div className="appbar__side">{right}</div>
    </header>
  )
}

function BackLink({ onBack }: { onBack?: () => void }) {
  const goBack = useGoBack()
  if (isTelegram) return null
  return (
    <button type="button" className="appbar__side" onClick={onBack ?? (() => goBack())} aria-label="Назад">
      <ChevronLeft size={24} strokeWidth={2} />
    </button>
  )
}

function ProfileLink() {
  const me = userById(ME_ID)!
  return (
    <Link to="/me" aria-label="Профиль" className="appbar__side">
      <img className="avatar" src={me.avatar} alt="" width={28} height={28} />
    </Link>
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

const groupDigits = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')

/**
 * Price field: digits are grouped by thousands while typing («20 000 000»), the caret stays
 * where the person is typing. Reports plain digits («20000000»), or '' when empty.
 */
export function MoneyInput({
  value,
  onChange,
  placeholder,
  disabled,
  label,
  maxDigits = 12,
}: {
  value: string
  onChange(digits: string): void
  placeholder?: string
  disabled?: boolean
  label?: string
  maxDigits?: number
}) {
  const ref = useRef<HTMLInputElement>(null)
  const digitsBeforeCaret = useRef<number | null>(null)
  const shown = groupDigits(value)

  useLayoutEffect(() => {
    const el = ref.current
    if (digitsBeforeCaret.current == null || !el || document.activeElement !== el) return
    let left = digitsBeforeCaret.current
    let pos = 0
    while (pos < shown.length && left > 0) {
      if (/\d/.test(shown[pos])) left--
      pos++
    }
    el.setSelectionRange(pos, pos)
    digitsBeforeCaret.current = null
  })

  return (
    <input
      ref={ref}
      className="field num"
      inputMode="numeric"
      autoComplete="off"
      aria-label={label}
      placeholder={placeholder}
      disabled={disabled}
      value={shown}
      onChange={(e) => {
        const el = e.target
        digitsBeforeCaret.current = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length
        onChange(el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, maxDigits))
      }}
    />
  )
}
