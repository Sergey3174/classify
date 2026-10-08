import { Check, ChevronRight, CircleCheck, ImagePlus, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { CategoryTile } from '../components/CategoryIcon'
import { AppBar, MainAction, MoneyInput, Segmented, Switch } from '../components/Chrome'
import { ListingCard } from '../components/ListingCard'
import { Sheet } from '../components/Sheets'
import { pickerPhotos } from '../mocks/listings'
import { categories, categoryById, cities, cityById, currencies, currencyOf } from '../mocks/reference'
import { useApp } from '../store/useApp'
import { useBackHandler, useGoBack } from '../navigation'
import { confirmDialog, haptic } from '../telegram/telegram'
import type { Condition, Listing, ListingDraft } from '../types'
import { formatMoney } from '../utils/format'
import { RulesContent } from './Rules'

// «Где» comes before «Описание»: the city fixes the currency the price is entered in
const STEPS = ['Категория', 'Фото', 'Где', 'Описание', 'Проверка'] as const
const TITLE_MAX = 60
const DESC_MAX = 1000
const PHOTOS_MAX = 10

export default function Create() {
  const navigate = useNavigate()
  const goBack = useGoBack()
  const { location } = useApp()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Listing | null>(null)
  // fixed once when the wizard opens, so the preview does not change on every render
  const [startedAt] = useState(() => new Date().toISOString())
  // rules open in a sheet here: leaving the wizard for /rules would lose the draft
  const [rulesOpen, setRulesOpen] = useState(false)
  const [d, setD] = useState<ListingDraft>({
    photos: [],
    title: '',
    description: '',
    price: '',
    negotiable: false,
    condition: 'used',
    cityId: location.cityId,
    district: location.district ?? '',
    delivery: false,
  })
  const set = (patch: Partial<ListingDraft>) => setD((prev) => ({ ...prev, ...patch }))
  const cur = currencies[currencyOf(d.cityId ?? location.cityId)]

  const valid = [
    !!d.categoryId,
    d.photos.length > 0,
    !!d.cityId,
    d.title.trim().length >= 3 && d.title.length <= TITLE_MAX && d.description.length <= DESC_MAX && (d.negotiable || Number(d.price) > 0),
    true,
  ][step]

  const next = useCallback(async () => {
    haptic.tap()
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0 })
      return
    }
    setBusy(true)
    const created = await api.createListing(d)
    setBusy(false)
    haptic.success()
    setDone(created)
  }, [step, d])

  const back = async () => {
    if (done) return navigate('/', { replace: true })
    if (step > 0) return setStep((s) => s - 1)
    const dirty = d.photos.length || d.title || d.description
    if (!dirty || (await confirmDialog('Удалить черновик объявления?'))) goBack({ ignoreOverride: true })
  }
  useBackHandler(back)

  if (done) {
    return (
      <div className="page page--flush">
        <div className="done">
          <div className="done__icon"><CircleCheck size={42} strokeWidth={2} /></div>
          <h1 className="t-title1" style={{ margin: 0 }}>Отправлено на проверку</h1>
          <p className="t-body hint" style={{ margin: 0, maxWidth: 300 }}>
            Обычно проверяем за 15 минут. Пришлём сообщение в боте, когда объявление появится в ленте.
          </p>
          <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 340, marginTop: 24 }}>
            <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('/my', { replace: true })}>
              Мои объявления
            </button>
            <button type="button" className="btn btn--plain btn--block" onClick={() => navigate('/', { replace: true })}>
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  const preview: Listing = {
    id: 'preview',
    title: d.title || 'Без названия',
    description: d.description,
    price: d.negotiable || !d.price ? null : Number(d.price),
    currency: currencyOf(d.cityId ?? 'bali'),
    categoryId: d.categoryId ?? 'home',
    cityId: d.cityId ?? 'bali',
    district: d.district || cityById(d.cityId ?? '')?.title,
    photos: d.photos,
    attributes: [],
    sellerId: 'u1',
    createdAt: startedAt,
    views: 0,
    favorites: 0,
    status: 'moderation',
  }

  return (
    <div className="page page--grouped">
      <AppBar
        title="Новое объявление"
        sub={`Шаг ${step + 1} из ${STEPS.length} · ${STEPS[step]}`}
        back={back}
      />
      <div className="steps" aria-label={`Шаг ${step + 1} из ${STEPS.length}`}>
        {STEPS.map((s, i) => <span key={s} data-on={i <= step} />)}
      </div>

      <div className="create__title">
        <h1 className="t-title1">
          {['Что продаёте?', 'Добавьте фото', 'Где находится?', 'Расскажите подробнее', 'Всё верно?'][step]}
        </h1>
      </div>

      {step === 0 && (
        <div className="section">
          <div className="section__body">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className="cell cell--icon"
                onClick={() => {
                  haptic.select()
                  set({ categoryId: c.id })
                  setStep(1)
                }}
              >
                <CategoryTile id={c.id} />
                <div className="cell__body cell__title">{c.title}</div>
                {d.categoryId === c.id ? (
                  <Check size={18} strokeWidth={2.6} color="var(--accent)" />
                ) : (
                  <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="photos">
            {d.photos.map((src, i) => (
              <div className="photos__item" key={src}>
                <img src={src} alt="" />
                {i === 0 && <span className="photos__cover pill pill--glass">Обложка</span>}
                <button
                  type="button"
                  className="photos__remove"
                  aria-label="Удалить фото"
                  onClick={() => set({ photos: d.photos.filter((p) => p !== src) })}
                >
                  <X size={14} strokeWidth={2.8} />
                </button>
              </div>
            ))}
            {d.photos.length < PHOTOS_MAX && (
              <button
                type="button"
                className="photos__add"
                onClick={() => {
                  // mock: real app opens <input type="file" accept="image/*" multiple>
                  const nextPhoto = pickerPhotos.find((p) => !d.photos.includes(p))
                  if (nextPhoto) set({ photos: [...d.photos, nextPhoto] })
                }}
              >
                <ImagePlus size={22} strokeWidth={2} />
                Добавить
              </button>
            )}
          </div>
          <div className="section__footer" style={{ padding: '12px 32px' }}>
            До {PHOTOS_MAX} фото. Первое станет обложкой. Объявления с 3+ фото получают вдвое больше сообщений.
          </div>
        </>
      )}

      {step === 3 && (
        /* описание и цена */
        <>
          <div className="section">
            <div className="section__header">Название</div>
            <div className="section__body section__body--pad">
              <input
                className="field"
                placeholder="Например, Honda PCX 160, 2023"
                maxLength={TITLE_MAX + 10}
                value={d.title}
                onChange={(e) => set({ title: e.target.value })}
              />
            </div>
            <div className={`section__footer counter num${d.title.length > TITLE_MAX ? ' counter--over' : ''}`}>
              {d.title.length}/{TITLE_MAX}
            </div>
          </div>

          <div className="section">
            <div className="section__header">Описание</div>
            <div className="section__body section__body--pad">
              <textarea
                className="field"
                rows={5}
                placeholder="Состояние, комплект, причина продажи, как забрать"
                value={d.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </div>
            <div className={`section__footer counter num${d.description.length > DESC_MAX ? ' counter--over' : ''}`}>
              {d.description.length}/{DESC_MAX}
            </div>
          </div>

          <div className="section">
            <div className="section__header">Цена</div>
            <div className="section__body">
              <label className="cell" style={{ opacity: d.negotiable ? 0.4 : 1 }}>
                <MoneyInput label="Цена" placeholder="0" disabled={d.negotiable} value={d.price} onChange={(v) => set({ price: v })} />
                <span className="cell__title hint" style={{ fontWeight: 700 }}>{cur.symbol}</span>
              </label>
              <div className="cell">
                <div className="cell__body cell__title">Договорная</div>
                <Switch label="Договорная цена" checked={d.negotiable} onChange={(v) => set({ negotiable: v })} />
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section__header">Состояние</div>
            <Segmented<Condition>
              value={d.condition ?? 'used'}
              options={[
                { value: 'new', label: 'Новое' },
                { value: 'used', label: 'Б/у' },
              ]}
              onChange={(v) => set({ condition: v })}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="section">
            <div className="section__header">Город</div>
            <div className="section__body">
              {cities.map((c) => (
                <button key={c.id} type="button" className="cell" onClick={() =>
                    // another country = another currency: an entered price would mean something else
                    set({ cityId: c.id, district: '', price: c.currency === currencyOf(d.cityId ?? '') ? d.price : '' })
                  }>
                  <div className="cell__body">
                    <div className="cell__title">{c.title}</div>
                    <div className="cell__subtitle">{c.country}</div>
                  </div>
                  {d.cityId === c.id && <Check size={18} strokeWidth={2.6} color="var(--accent)" />}
                </button>
              ))}
            </div>
          </div>
          <div className="section" style={{ marginBottom: 8 }}>
            <div className="section__header">Район</div>
          </div>
          <div className="chips" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
            {cityById(d.cityId ?? '')?.districts.map((dist) => (
              <button key={dist} type="button" className="chip" aria-pressed={d.district === dist} onClick={() => set({ district: dist })}>
                {dist}
              </button>
            ))}
          </div>
          <div className="section">
            <div className="section__body">
              <div className="cell">
                <div className="cell__body">
                  <div className="cell__title">Могу доставить</div>
                  <div className="cell__subtitle">Покажем значок «Доставка»</div>
                </div>
                <Switch label="Доставка" checked={d.delivery} onChange={(v) => set({ delivery: v })} />
              </div>
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div style={{ width: 200, margin: '0 auto 24px', pointerEvents: 'none' }}>
            <ListingCard l={preview} />
          </div>
          <div className="section">
            <div className="section__body">
              {(
                [
                  ['Категория', categoryById(d.categoryId ?? '')?.title, 0],
                  ['Фото', `${d.photos.length} шт.`, 1],
                  ['Место', [cityById(d.cityId ?? '')?.title, d.district].filter(Boolean).join(', '), 2],
                  ['Название', d.title, 3],
                  ['Цена', d.negotiable || !d.price ? 'Договорная' : formatMoney(Number(d.price), currencyOf(d.cityId ?? '')), 3],
                ] as const
              ).map(([label, value, target]) => (
                <button key={label} type="button" className="cell" onClick={() => setStep(target)}>
                  <div className="cell__body cell__title">{label}</div>
                  <div className="cell__value" style={{ maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                  <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
                </button>
              ))}
            </div>
            <div className="section__footer">
              Публикуя объявление, вы соглашаетесь с{' '}
              <button type="button" className="link" onClick={() => setRulesOpen(true)}>
                правилами Classify
              </button>
              . Объявление появится после проверки модератором.
            </div>
          </div>
        </>
      )}

      {step > 0 && (
        <MainAction
          text={step === STEPS.length - 1 ? 'Опубликовать' : 'Продолжить'}
          onClick={next}
          disabled={!valid}
          loading={busy}
          grouped
          secondary={
            <button type="button" className="btn btn--plain btn--block btn--sm" style={{ marginBottom: 6 }} onClick={back}>
              Назад к шагу «{STEPS[step - 1]}»
            </button>
          }
        />
      )}
      {rulesOpen && (
        <Sheet title="Правила Classify" onClose={() => setRulesOpen(false)}>
          <RulesContent />
        </Sheet>
      )}
    </div>
  )
}
