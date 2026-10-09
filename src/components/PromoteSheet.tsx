import { Rocket, Star } from 'lucide-react'
import { useRef, useState } from 'react'
import { Sheet } from './Sheets'
import type { Listing } from '../types'

export function PromoteSheet({ listing, stars, onClose, onPromote }: {
  listing: Listing
  stars: number
  onClose(): void
  onPromote(): Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = useRef(false)
  const confirm = async () => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      await onPromote()
      onClose()
    } catch {
      setError('Не получилось поднять объявление. Попробуйте ещё раз.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <Sheet title="Поднять объявление" onClose={onClose} dismissible={!busy}
      footer={<button type="button" className="btn btn--primary btn--block" disabled={busy} aria-busy={busy} onClick={confirm}>
        <Rocket size={18} /> {busy ? 'Поднимаем…' : 'Поднять'}
      </button>}>
      <div className="promote">
        <div className="promote__icon"><Rocket size={28} aria-hidden="true" /></div>
        <p className="t-title3 promote__question">Хотите поднять объявление в поиске?</p>
        <p className="t-sub hint promote__listing">{listing.title}</p>
        <div className="promote__price">
          <span className="t-body hint">Стоимость</span>
          <span className="t-headline num promote__stars"><Star size={18} fill="currentColor" aria-hidden="true" /> {stars} Telegram Stars</span>
        </div>
        {error && <p className="t-sub" role="alert">{error}</p>}
      </div>
    </Sheet>
  )
}
