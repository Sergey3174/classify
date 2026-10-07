import { Check, ChevronRight, MapPin, Search, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { listings as seedListings } from '../mocks/listings'
import { cities } from '../mocks/reference'
import { plural } from '../utils/format'
import { useApp } from '../store/app'
import { haptic } from '../telegram/telegram'
import type { Condition, ListingFilters, SortOrder } from '../types'
import { Segmented, Switch } from './Chrome'

export function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose(): void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grabber" />
        <div className="sheet__head">
          <div className="t-title3">{title}</div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Закрыть">
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </>
  )
}

/** Country → city → district picker. Locality is the product's main filter. */
export function LocationSheet({ onClose }: { onClose(): void }) {
  const { location, setLocation } = useApp()
  const [cityId, setCityId] = useState(location.cityId)
  const [district, setDistrict] = useState<string | null>(location.district)
  const [query, setQuery] = useState('')
  const city = cities.find((c) => c.id === cityId)!

  const q = query.trim().toLowerCase()
  const visible = cities.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.districts.some((d) => d.toLowerCase().includes(q)),
  )
  const countries = [...new Set(visible.map((c) => c.country))]
  const count = (cid: string, d: string | null) =>
    seedListings.filter((l) => l.status === 'active' && l.cityId === cid && (!d || l.district?.includes(d))).length
  const total = count(cityId, district)

  const apply = () => {
    haptic.success()
    setLocation({ cityId, district })
    onClose()
  }

  return (
    <Sheet
      title="Где ищем"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--primary btn--block" onClick={apply}>
          {total ? `Показать ${total} ${plural(total, 'объявление', 'объявления', 'объявлений')}` : `Выбрать ${district ?? city.title}`}
        </button>
      }
    >
      <div style={{ padding: '0 var(--gutter) 14px' }}>
        <label className="searchfield">
          <Search size={16} strokeWidth={2.4} />
          <input placeholder="Страна, город или район" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
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
  const [f, setF] = useState<ListingFilters>(value)
  const set = (patch: Partial<ListingFilters>) => setF((prev) => ({ ...prev, ...patch }))
  const num = (s: string) => (s.trim() === '' ? undefined : Math.max(0, Number(s.replace(/\D/g, ''))))

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
        <div className="section__header">Цена, $</div>
        <div className="section__body" style={{ display: 'flex' }}>
          <label className="cell" style={{ flex: 1 }}>
            <span className="hint">от</span>
            <input
              className="field num"
              inputMode="numeric"
              placeholder="0"
              value={f.priceFrom ?? ''}
              onChange={(e) => set({ priceFrom: num(e.target.value) })}
            />
          </label>
          <div style={{ width: 0.5, background: 'var(--separator)' }} />
          <label className="cell" style={{ flex: 1 }}>
            <span className="hint">до</span>
            <input
              className="field num"
              inputMode="numeric"
              placeholder="любая"
              value={f.priceTo ?? ''}
              onChange={(e) => set({ priceTo: num(e.target.value) })}
            />
          </label>
        </div>
        <div className="section__footer">Цены в рупиях и рублях пересчитываем в доллары по курсу дня.</div>
      </div>

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
