import { useId, useRef, useState } from 'react'
import { api, REPORT_TEXT_MAX } from '../api'
import { useApp } from '../store/useApp'
import { haptic } from '../telegram/telegram'
import { Sheet } from './Sheets'

export function ReportSheet({ listingId, onClose }: { listingId: string; onClose(): void }) {
  const { showToast } = useApp()
  const inputId = useId()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = useRef(false)
  const submit = async () => {
    if (pending.current || !text.trim() || text.length > REPORT_TEXT_MAX) return
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      await api.reportListing(listingId, text)
      haptic.success()
      showToast('Жалоба отправлена')
      onClose()
    } catch (error) {
      haptic.error()
      setError(error instanceof Error ? error.message : 'Не удалось отправить жалобу. Попробуйте ещё раз.')
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <Sheet title="Пожаловаться на объявление" onClose={onClose} dismissible={!busy}
      footer={<button type="button" className="btn btn--primary btn--block" onClick={submit}
        disabled={busy || !text.trim()} aria-busy={busy}>
        {busy ? 'Отправляем…' : 'Пожаловаться'}
      </button>}>
      <div className="section">
        <label className="section__header" htmlFor={inputId} style={{ display: 'block', paddingBottom: 12 }}>Причина жалобы</label>
        <div className="section__body section__body--pad">
          <textarea id={inputId} className="field" rows={5} autoFocus
            placeholder="Расскажите, что не так с объявлением"
            maxLength={REPORT_TEXT_MAX} value={text} disabled={busy}
            onChange={(event) => setText(event.target.value)} />
        </div>
        <div className="section__footer counter num">{text.length}/{REPORT_TEXT_MAX}</div>
        {error && <p className="t-sub" role="alert" style={{ color: 'var(--destructive)' }}>{error}</p>}
      </div>
    </Sheet>
  )
}