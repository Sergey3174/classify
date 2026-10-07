import { Search as SearchIcon, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { CategoryIcon } from '../components/CategoryIcon'
import { Empty, TopBar } from '../components/Chrome'
import { CardSkeletons, ListingCard } from '../components/ListingCard'
import { FilterSheet } from '../components/Sheets'
import { categories, cityById } from '../mocks/reference'
import { useApp } from '../store/app'
import type { CategoryId, ListingFilters } from '../types'
import { plural } from '../utils/format'
import { useAsync } from '../utils/useAsync'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const { location } = useApp()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [filters, setFilters] = useState<ListingFilters>({ sort: 'new' })
  const [sheet, setSheet] = useState(false)
  const categoryId = (params.get('cat') as CategoryId | null) ?? undefined

  const effective = useMemo<ListingFilters>(
    () => ({ ...filters, query, categoryId, cityId: location.cityId }),
    [filters, query, categoryId, location.cityId],
  )
  const { data, loading } = useAsync(() => api.getListings(effective), [JSON.stringify(effective)])
  const items = data ?? []

  const activeCount = [filters.priceFrom, filters.priceTo, filters.condition, filters.delivery, filters.withPhoto].filter(
    (v) => v !== undefined,
  ).length + (filters.sort && filters.sort !== 'new' ? 1 : 0)

  const setCategory = (id?: CategoryId) => {
    const next = new URLSearchParams(params)
    if (id) next.set('cat', id)
    else next.delete('cat')
    setParams(next, { replace: true })
  }

  return (
    <div className="page">
      <TopBar plain />
      <div className="search__bar">
        <label className="searchfield">
          <SearchIcon size={17} strokeWidth={2.4} />
          <input
            autoFocus
            type="search"
            enterKeyHint="search"
            placeholder={`Поиск — ${cityById(location.cityId)?.title}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" aria-label="Очистить" onClick={() => setQuery('')} style={{ color: 'var(--hint)', display: 'grid' }}>
              <X size={16} strokeWidth={2.6} />
            </button>
          )}
        </label>
        <button
          type="button"
          className="search__filter"
          data-active={activeCount > 0}
          aria-label={`Фильтры${activeCount ? `: ${activeCount}` : ''}`}
          onClick={() => setSheet(true)}
        >
          <SlidersHorizontal size={17} strokeWidth={2.4} />
        </button>
      </div>

      <div className="chips" style={{ paddingTop: 4 }}>
        <button type="button" className="chip" aria-pressed={!categoryId} onClick={() => setCategory(undefined)}>
          Все
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={categoryId === c.id} onClick={() => setCategory(c.id)}>
            {categoryId !== c.id && <CategoryIcon id={c.id} size={16} />}
            {c.title}
          </button>
        ))}
      </div>

      <div className="search__summary">
        <span className="t-foot hint num">
          {loading ? 'Ищем…' : `${items.length} ${plural(items.length, 'объявление', 'объявления', 'объявлений')}`}
        </span>
        {activeCount > 0 && (
          <button type="button" className="t-foot" style={{ color: 'var(--link)' }} onClick={() => setFilters({ sort: 'new' })}>
            Сбросить фильтры
          </button>
        )}
      </div>

      {loading ? (
        <CardSkeletons />
      ) : items.length ? (
        <div className="grid">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : (
        <Empty
          icon={<SearchX size={30} />}
          title="Ничего не нашли"
          text={query ? `По запросу «${query}» в этом городе пока нет объявлений. Попробуйте другое слово или уберите фильтры.` : 'Попробуйте убрать часть фильтров или выбрать другой район.'}
          action={
            <button type="button" className="btn btn--tinted" onClick={() => { setQuery(''); setFilters({ sort: 'new' }); setCategory(undefined) }}>
              Показать все
            </button>
          }
        />
      )}

      {sheet && <FilterSheet value={filters} onApply={setFilters} onClose={() => setSheet(false)} />}
    </div>
  )
}
