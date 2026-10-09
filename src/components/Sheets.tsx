import { AttributeFilterField } from './AttributeFilterField'
import { categoryAttributes } from '../data/categoryAttributes'
import { useLazyDetectLocationQuery } from '../api/geolocation'
import { Check, ChevronRight, LocateFixed, MapPin, Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { listings as seedListings } from '../mocks/listings'
import { api, MAX_ACTIVE_ALERTS } from '../api'
import { useAsync } from '../utils/useAsync'
import { categories, cities, currencies, currencyOf } from '../mocks/reference'
import { plural } from '../utils/format'
import { useApp } from '../store/useApp'
import { haptic } from '../telegram/telegram'
import type { Alert, AlertDraft, Condition, ListingFilters, SortOrder } from '../types'
import { CategoryIcon } from './CategoryIcon'
import { MoneyInput, Segmented, Switch } from './Chrome'

export function Sheet({
  title,
  onClose,
  children,
  footer,
  dismissible = true,
}: {
  title: string
  onClose(): void
  children: ReactNode
  footer?: ReactNode
  dismissible?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismissible && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, dismissible])

  return (
    <>
      <div className="sheet-backdrop" onClick={dismissible ? onClose : undefined} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grabber" />
        <div className="sheet__head">
          <div className="t-title3">{title}</div>
          {dismissible && <button type="button" className="sheet__close" onClick={onClose} aria-label="Закрыть">
            <X size={16} strokeWidth={2.6} />
          </button>}
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </>
  )
}

/** Country → city → district picker. Locality is the product's main filter. */
export function LocationSheet({ onClose, required = false }: { onClose(): void; required?: boolean }) {
  const { location, setLocation, showToast } = useApp()
  const [cityId, setCityId] = useState(location.cityId)
  const [district, setDistrict] = useState<string | null>(location.district)
  const [query, setQuery] = useState('')
  const city = cities.find((c) => c.id === cityId)

  const q = query.trim().toLowerCase()
  const visible = cities.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.districts.some((d) => d.toLowerCase().includes(q)),
  )
  const countries = [...new Set(visible.map((c) => c.country))]
  const count = (cid: string, d: string | null) =>
    seedListings.filter((l) => l.status === 'active' && l.cityId === cid && (!d || l.district?.includes(d))).length
  const total = count(cityId, district)

  const apply = () => {
    if (!city) return
    haptic.success()
    setLocation({ cityId, district, source: 'manual' })
    onClose()
  }

  const [detectLocation, { isFetching: detecting }] = useLazyDetectLocationQuery()
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const detect = async () => {
    try {
      const res = await detectLocation().unwrap()
      if (!mounted.current) return
      if (!res) {
        haptic.error()
        showToast('Не получилось определить — выберите город вручную')
        return
      }
      haptic.success()
      setLocation({ cityId: res.cityId, district: null, source: 'auto' })
      showToast('Определили: ' + cities.find((c) => c.id === res.cityId)?.title)
      onClose()
    } catch {
      if (!mounted.current) return
      haptic.error()
      showToast('Не получилось определить — выберите город вручную')
    }
  }

  return (
    <Sheet
      title="Где ищем"
      dismissible={!required}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--primary btn--block" onClick={apply} disabled={!city}>
          {total ? `Показать ${total} ${plural(total, 'объявление', 'объявления', 'объявлений')}` : city ? 'Выбрать ' + (district ?? city.title) : 'Выберите город'}
        </button>
      }
    >
      <div style={{ padding: '0 var(--gutter) 14px' }}>
        <label className="searchfield">
          <Search size={16} strokeWidth={2.4} />
          <input placeholder="Страна, город или район" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="section">
        <div className="section__body">
          <button type="button" className="cell cell--icon alert-cta" onClick={detect} disabled={detecting}>
            <span className="tile-icon"><LocateFixed size={15} strokeWidth={2.4} /></span>
            <div className="cell__body">
              <div className="cell__title">{detecting ? 'Определяем…' : 'Определить автоматически'}</div>
              <div className="cell__subtitle">По сети — только город, район выберите сами</div>
            </div>
          </button>
        </div>
      </div>

      {countries.map((country) => (
        <div className="section" key={country}>
          <div className="section__header">{country}</div>
          <div className="section__body">
            {visible
              .filter((c) => c.country === country)
              .map((c) => {
                const on = c.id === cityId
                const districts = q && !c.title.toLowerCase().includes(q) ? c.districts.filter((d) => d.toLowerCase().includes(q)) : c.districts
                return (
                  <div key={c.id} className="place-row" data-on={on}>
                    <button
                      type="button"
                      className="cell"
                      aria-expanded={on}
                      onClick={() => {
                        haptic.select()
                        if (!on) {
                          setCityId(c.id)
                          setDistrict(null)
                        }
                      }}
                    >
                      <span className="place-row__pin"><MapPin size={15} strokeWidth={2.4} /></span>
                      <div className="cell__body">
                        <div className="cell__title" style={{ fontWeight: on ? 700 : 400 }}>{c.title}</div>
                      </div>
                      <span className="cell__subtitle num">{count(c.id, null) || ''}</span>
                      {on ? <Check size={18} strokeWidth={2.8} color="var(--accent-text)" /> : <ChevronRight size={16} strokeWidth={2.4} className="cell__chev" />}
                    </button>
                    {on && (
                      <div className="place-row__districts">
                        <button type="button" className="chip" aria-pressed={district === null} onClick={() => setDistrict(null)}>
                          Весь город
                        </button>
                        {districts.map((d) => (
                          <button key={d} type="button" className="chip" aria-pressed={district === d} onClick={() => { haptic.select(); setDistrict(d) }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      ))}

      {countries.length === 0 && (
        <div className="empty" style={{ padding: '24px 28px' }}>
          <div className="t-headline">Не нашли «{query}»</div>
          <div className="t-sub hint">Пока работаем в этих городах. Напишите в поддержку — добавим ваш.</div>
        </div>
      )}

      <div className="section__footer" style={{ padding: '0 calc(var(--gutter) + 4px) 8px' }}>
        Объявления из выбранного района покажем первыми, дальше — по расстоянию.
      </div>
    </Sheet>
  )
}

const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'new', label: 'Новые' },
  { value: 'near', label: 'Ближе' },
  { value: 'cheap', label: 'Дешевле' },
  { value: 'expensive', label: 'Дороже' },
]

export function FilterSheet({
  value,
  onApply,
  onClose,
}: {
  value: ListingFilters
  onApply(f: ListingFilters): void
  onClose(): void
}) {
  const { location } = useApp()
  const cur = currencies[currencyOf(location.cityId)]
  const [f, setF] = useState<ListingFilters>(value)
  const fields = f.categoryId ? categoryAttributes[f.categoryId] : []
  const set = (patch: Partial<ListingFilters>) => setF((prev) => ({ ...prev, ...patch }))

  return (
    <Sheet
      title="Фильтры"
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn--tinted"
            onClick={() => setF({ query: f.query, categoryId: f.categoryId })}
          >
            Сбросить
          </button>
          <button
            type="button"
            className="btn btn--primary"
            style={{ flex: 1 }}
            onClick={() => {
              haptic.tap()
              onApply(f)
              onClose()
            }}
          >
            Применить
          </button>
        </div>
      }
    >
      <div className="section">
        <div className="section__header">Сортировка</div>
        <Segmented value={f.sort ?? 'new'} options={sortOptions} onChange={(v) => set({ sort: v })} />
      </div>

      <div className="section">
        <div className="section__header">Цена, {cur.symbol}</div>
        <div className="section__body" style={{ display: 'flex' }}>
          <label className="cell" style={{ flex: 1 }}>
            <span className="hint">от</span>
            <MoneyInput label="Цена от" placeholder="0" value={String(f.priceFrom ?? '')} onChange={(v) => set({ priceFrom: v ? Number(v) : undefined })} />
          </label>
          <div style={{ width: 0.5, background: 'var(--separator)' }} />
          <label className="cell" style={{ flex: 1 }}>
            <span className="hint">до</span>
            <MoneyInput label="Цена до" placeholder="любая" value={String(f.priceTo ?? '')} onChange={(v) => set({ priceTo: v ? Number(v) : undefined })} />
          </label>
        </div>
        <div className="section__footer">Цены в {cur.name} — валюте страны, где опубликовано объявление.</div>
      </div>

      {fields.length > 0 && (
        <div className="section">
          <div className="section__header">Характеристики</div>
          <div className="section__body">
            {fields.map(([label, placeholder]) => (
              <AttributeFilterField
                key={label}
                label={label}
                placeholder={placeholder}
                value={f.attributes?.[label] ?? ''}
                onChange={(value) => set({ attributes: { ...f.attributes, [label]: value } })}
                options={[...new Set(seedListings.filter((l) => l.categoryId === f.categoryId)
                  .flatMap((l) => l.attributes.filter((a) => a.label === label).map((a) => a.value)))]}
              />
            ))}
          </div>
          <div className="section__footer">Выберите или введите точное значение. Ненужные поля оставьте пустыми.</div>
        </div>
      )}

      <div className="section">
        <div className="section__header">Состояние</div>
        <Segmented<'any' | Condition>
          value={f.condition ?? 'any'}
          options={[
            { value: 'any', label: 'Любое' },
            { value: 'new', label: 'Новое' },
            { value: 'used', label: 'Б/у' },
          ]}
          onChange={(v) => set({ condition: v === 'any' ? undefined : v })}
        />
      </div>

      <div className="section">
        <div className="section__body">
          <div className="cell">
            <div className="cell__body cell__title">С доставкой</div>
            <Switch label="С доставкой" checked={!!f.delivery} onChange={(v) => set({ delivery: v || undefined })} />
          </div>
          <div className="cell">
            <div className="cell__body cell__title">Только с фото</div>
            <Switch label="Только с фото" checked={!!f.withPhoto} onChange={(v) => set({ withPhoto: v || undefined })} />
          </div>
        </div>
      </div>
    </Sheet>
  )
}

/**
 * «Ищу» — create a subscription. Nothing is published: when a matching listing appears,
 * the bot messages the user. Opened from «Уведомления» (+) and from search («Уведомить меня»).
 */
export function AlertSheet({ initial, onClose, onCreated }: { initial?: Partial<AlertDraft>; onClose(): void; onCreated?(a: Alert): void }) {
  const { location, showToast } = useApp()
  const [d, setD] = useState<AlertDraft>({
    query: initial?.query ?? '',
    categoryId: initial?.categoryId,
    cityId: initial?.cityId ?? location.cityId,
    district: initial?.district ?? location.district ?? undefined,
    priceTo: initial?.priceTo,
    condition: initial?.condition,
  })
  const [busy, setBusy] = useState(false)
  const existing = useAsync(() => api.getAlerts(), [])
  const atLimit = (existing.data ?? []).filter((a) => a.active).length >= MAX_ACTIVE_ALERTS
  const set = (patch: Partial<AlertDraft>) => setD((prev) => ({ ...prev, ...patch }))
  const city = cities.find((c) => c.id === d.cityId)!
  const cur = currencies[city.currency]
  const valid = d.query.trim().length >= 2 || !!d.categoryId

  const submit = async () => {
    setBusy(true)
    try {
      const a = await api.createAlert(d)
      haptic.success()
      showToast('Уведомление создано — пришлём в бота')
      onCreated?.(a)
      onClose()
    } catch (e) {
      haptic.error()
      showToast(e instanceof Error ? e.message : 'Не получилось')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      title="Уведомить меня"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--primary btn--block" disabled={!valid || busy || atLimit} onClick={submit}>
          {busy ? 'Сохраняем…' : atLimit ? `Уже ${MAX_ACTIVE_ALERTS} активных` : 'Уведомить меня'}
        </button>
      }
    >
      {atLimit && (
        <div className="section">
          <div className="section__body section__body--pad t-sub">
            У вас уже {MAX_ACTIVE_ALERTS} активных уведомлений — это максимум. Удалите или поставьте на паузу одно из них в разделе «Уведомления».
          </div>
        </div>
      )}

      <div className="section">
        <div className="section__header">Что ищете</div>
        <div className="section__body section__body--pad">
          <input
            className="field"
            autoFocus
            placeholder="Например, MacBook Air M2"
            maxLength={60}
            value={d.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </div>
        <div className="section__footer">Объявление «ищу» никто не увидит. Как только опубликуют подходящее — пришлём сообщение в бота.</div>
      </div>

      <div className="section" style={{ marginBottom: 8 }}>
        <div className="section__header">Категория</div>
      </div>
      <div className="chips" style={{ marginBottom: 16 }}>
        <button type="button" className="chip" aria-pressed={!d.categoryId} onClick={() => set({ categoryId: undefined })}>Любая</button>
        {categories.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={d.categoryId === c.id} onClick={() => { haptic.select(); set({ categoryId: c.id }) }}>
            {d.categoryId !== c.id && <CategoryIcon id={c.id} size={16} />}
            {c.title}
          </button>
        ))}
      </div>

      <div className="section" style={{ marginBottom: 8 }}>
        <div className="section__header">Где</div>
      </div>
      <div className="chips" style={{ marginBottom: 8 }}>
        {cities.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={d.cityId === c.id} onClick={() => {
              haptic.select()
              // the price limit is in the city's currency — drop it when the currency changes
              set({ cityId: c.id, district: undefined, priceTo: c.currency === city.currency ? d.priceTo : undefined })
            }}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" className="chip chip--quiet" aria-pressed={!d.district} onClick={() => set({ district: undefined })}>Весь город</button>
        {city.districts.map((dist) => (
          <button key={dist} type="button" className="chip chip--quiet" aria-pressed={d.district === dist} onClick={() => set({ district: dist })}>
            {dist}
          </button>
        ))}
      </div>

      <div className="section">
        <div className="section__header">Цена до, {cur.symbol}</div>
        <div className="section__body">
          <label className="cell">
            <span className="hint">до</span>
            <MoneyInput label="Цена до" placeholder="любая" value={String(d.priceTo ?? '')} onChange={(v) => set({ priceTo: v ? Number(v) : undefined })} />
          </label>
        </div>
        <div className="section__footer">В {cur.name} — валюте страны.</div>
      </div>

      <div className="section">
        <div className="section__header">Состояние</div>
        <Segmented<'any' | Condition>
          value={d.condition ?? 'any'}
          options={[
            { value: 'any', label: 'Любое' },
            { value: 'new', label: 'Новое' },
            { value: 'used', label: 'Б/у' },
          ]}
          onChange={(v) => set({ condition: v === 'any' ? undefined : v })}
        />
      </div>
    </Sheet>
  )
}
