import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { CategoryIcon } from '../components/CategoryIcon'
import { categoryColor } from '../components/categoryStyle'
import { AppBar, Empty } from '../components/Chrome'
import { CardSkeletons, ListingCard } from '../components/ListingCard'
import { LocationSheet } from '../components/Sheets'
import { categories, cityById } from '../mocks/reference'
import { useApp } from '../store/useApp'
import type { SortOrder } from '../types'
import { plural } from '../utils/format'
import { useAsync } from '../utils/useAsync'

export default function Home() {
  const navigate = useNavigate()
  const { location } = useApp()
  const [sort, setSort] = useState<SortOrder>('near')
  const [picking, setPicking] = useState(false)
  const city = cityById(location.cityId)!

  const { data, loading } = useAsync(() => api.getListings({ cityId: location.cityId, sort }), [location.cityId, sort])
  const items = data ?? []
  // listings in the chosen district first, then the rest of the city by distance
  const inDistrict = location.district ? items.filter((l) => l.district?.includes(location.district!)).length : items.length
  const ordered = location.district
    ? [...items.filter((l) => l.district?.includes(location.district!)), ...items.filter((l) => !l.district?.includes(location.district!))]
    : items

  return (
    <div className="page home">
      <AppBar
        center={
          <button type="button" className="appbar__center place" onClick={() => setPicking(true)} aria-label={`Место: ${city.title}. Изменить`}>
            <span className="appbar__title">
              {city.title}
              <ChevronDown size={14} strokeWidth={3} />
            </span>
            <span className="appbar__sub">
              {location.source === 'auto' ? `${city.country} · определено автоматически` : `${city.country} · ${location.district ?? 'весь город'}`}
            </span>
          </button>
        }
        right={
          <Link to="/search" className="appbar__side" aria-label="Поиск">
            <Search size={22} strokeWidth={2} />
          </Link>
        }
      />

      <div className="hscroll home__cats" role="list" aria-label="Категории">
        {categories.map((c) => (
          <Link key={c.id} to={`/search?cat=${c.id}`} className="home__cat" role="listitem">
            <span className="home__cat-tile" style={{ background: `color-mix(in srgb, ${categoryColor(c.id)} 18%, transparent)` }}>
              <CategoryIcon id={c.id} size={22} />
            </span>
            <span className="t-cap">{c.title}</span>
          </Link>
        ))}
      </div>

      <div className="home__feed-head">
        <div>
          <h2 className="t-title2">Рядом с вами</h2>
          <div className="t-foot hint num">
            {loading
              ? 'Загружаем…'
              : location.district
                ? `${inDistrict} в районе ${location.district} · ${items.length} всего`
                : `${items.length} ${plural(items.length, 'объявление', 'объявления', 'объявлений')}`}
          </div>
        </div>
        <div className="home__sort">
          <button type="button" aria-pressed={sort === 'near'} onClick={() => setSort('near')}>Ближе</button>
          <button type="button" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>Новые</button>
        </div>
      </div>

      {loading ? (
        <CardSkeletons n={6} />
      ) : ordered.length ? (
        <div className="grid">{ordered.map((l) => <ListingCard key={l.id} l={l} />)}</div>
      ) : (
        <Empty
          icon={<Search size={30} />}
          title={`В городе ${city.title} пока пусто`}
          text="Станьте первым — подайте объявление, его увидят все, кто ищет рядом."
          action={<button type="button" className="btn btn--primary" onClick={() => navigate('/create')}>Подать объявление</button>}
        />
      )}

      {picking && <LocationSheet onClose={() => setPicking(false)} />}
    </div>
  )
}
