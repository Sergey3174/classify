import { Camera, Clock, IdCard, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { AppBar, MainAction } from '../components/Chrome'
import { KycMark } from '../components/Kyc'
import { ME_ID, userById } from '../mocks/users'
import { useApp } from '../store/useApp'
import { haptic } from '../telegram/telegram'
import type { KycStatus } from '../types'

const text: Record<KycStatus, { title: string; body: string }> = {
  none: {
    title: 'Подтвердите личность',
    body: 'После проверки в ваших объявлениях и профиле появится отметка «Личность подтверждена» — покупатели больше доверяют таким продавцам.',
  },
  pending: {
    title: 'Проверяем документы',
    body: 'Обычно это занимает несколько минут. Пришлём сообщение в бота, когда закончим.',
  },
  verified: {
    title: 'Личность подтверждена',
    body: 'Отметка показывается рядом с вашим именем в объявлениях и в профиле.',
  },
}

/** KYC — identity check, opened from «Мой профиль». */
export default function Kyc() {
  const { showToast } = useApp()
  const [status, setStatus] = useState<KycStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const me = userById(ME_ID)!

  useEffect(() => {
    let alive = true
    const load = () => api.getKyc().then((s) => alive && setStatus(s))
    load()
    // while the check is running, refresh the status so the result appears by itself
    const t = window.setInterval(() => status === 'pending' && load(), 1500)
    return () => {
      alive = false
      window.clearInterval(t)
    }
  }, [status])

  useEffect(() => {
    if (status === 'verified') haptic.success()
  }, [status])

  const start = async () => {
    haptic.tap()
    setBusy(true)
    // mock: the real provider (document scan + selfie) is not decided yet
    setStatus(await api.startKyc())
    setBusy(false)
    showToast('Документы отправлены на проверку')
  }

  return (
    <div className="page page--grouped">
      <AppBar back title="Проверка личности" sub="KYC" />

      {status && (
        <>
          <div className="kyc__head">
            <div className="kyc__icon" data-status={status}>
              {status === 'verified' ? <ShieldCheck size={30} /> : status === 'pending' ? <Clock size={30} /> : <ShieldQuestion size={30} />}
            </div>
            <div className="t-title3">{text[status].title}</div>
            <div className="t-sub hint">{text[status].body}</div>
          </div>

          {status === 'none' && (
            <div className="section">
              <div className="section__header">Что понадобится</div>
              <div className="section__body">
                <div className="cell cell--icon">
                  <span className="tile-icon" style={{ background: 'var(--tile-blue)' }}><IdCard size={15} /></span>
                  <div className="cell__body">
                    <div className="cell__title">Паспорт или ID-карта</div>
                    <div className="cell__subtitle">Фото разворота с фотографией</div>
                  </div>
                </div>
                <div className="cell cell--icon">
                  <span className="tile-icon" style={{ background: 'var(--tile-indigo)' }}><Camera size={15} /></span>
                  <div className="cell__body">
                    <div className="cell__title">Селфи</div>
                    <div className="cell__subtitle">Чтобы сверить с документом</div>
                  </div>
                </div>
              </div>
              <div className="section__footer">Документы видит только сервис проверки. Покупатели видят лишь отметку, без данных документа.</div>
            </div>
          )}

          <div className="section">
            <div className="section__header">Так вас увидят покупатели</div>
            <div className="section__body">
              <div className="cell">
                <img className="avatar" src={me.avatar} alt="" width={36} height={36} />
                <div className="cell__body">
                  <div className="cell__title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {me.name}
                    <KycMark user={{ kyc: status }} />
                  </div>
                  <div className="cell__subtitle">{status === 'verified' ? 'Личность подтверждена' : 'Без отметки о проверке'}</div>
                </div>
              </div>
            </div>
          </div>

          {status === 'none' && <MainAction text="Пройти проверку" onClick={start} loading={busy} grouped />}
        </>
      )}
    </div>
  )
}
