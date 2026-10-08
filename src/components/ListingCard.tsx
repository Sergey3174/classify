import { Heart, Images, MapPin, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import type { Listing } from '../types'
import { formatDistance, formatPrice, formatUnit, typo } from '../utils/format'

function FavButton({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useApp()
  const on = isFavorite(id)
  return (
    <button
      type="button"
      className="fav"
      aria-pressed={on}
      aria-label={on ? 'Убрать из избранного' : 'В избранное'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(id)
      }}
    >
      <Heart size={15} strokeWidth={2.2} fill={on ? 'currentColor' : 'none'} />
    </button>
  )
}

export function Where({ l }: { l: Listing }) {
  const parts = [l.district?.split(',')[0], formatDistance(l.distanceKm)].filter(Boolean)
  return (
    <div className="meta">
      <MapPin size={11} strokeWidth={2.4} />
      <span>{parts.join(' · ')}</span>
    </div>
  )
}

/** `isNew` — «Новое» badge: a match published since the person last opened the alert. */
export function ListingCard({ l, isNew }: { l: Listing; isNew?: boolean }) {
  return (
    <Link to={`/listing/${l.id}`} className="card">
      <div className="card__media">
        <img src={l.photos[0]} alt="" loading="lazy" />
        {(isNew || l.promoted) && (
          <span className="card__badges">
            {isNew && <span className="pill pill--new">Новое</span>}
            {l.promoted && (
              <span className="pill pill--glass">
                <Rocket size={10} strokeWidth={2.6} /> Поднято
              </span>
            )}
          </span>
        )}
        {l.photos.length > 1 && (
          <span className="card__count pill pill--glass num">
            <Images size={10} strokeWidth={2.6} /> {l.photos.length}
          </span>
        )}
        <FavButton id={l.id} />
      </div>
      <div className="card__price num">
        {formatPrice(l)}
        <span className="card__unit">{formatUnit(l)}</span>
      </div>
      <div className="card__title">{typo(l.title)}</div>
      <Where l={l} />
    </Link>
  )
}

export function ListingRow({ l, aside }: { l: Listing; aside?: React.ReactNode }) {
  return (
    <Link to={`/listing/${l.id}`} className="row">
      <img className="row__thumb" src={l.photos[0]} alt="" loading="lazy" />
      <div className="row__body">
        <div className="t-headline num">
          {formatPrice(l)}
          <span className="card__unit">{formatUnit(l)}</span>
        </div>
        <div className="t-sub" style={{ marginTop: 1 }}>{typo(l.title)}</div>
        <Where l={l} />
      </div>
      {aside}
    </Link>
  )
}

export function CardSkeletons({ n = 4 }: { n?: number }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: n }, (_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--r-card)' }} />
          <div className="skeleton" style={{ height: 18, width: '50%', marginTop: 10 }} />
          <div className="skeleton" style={{ height: 14, width: '85%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  )
}

export function RowSkeletons({ n = 3 }: { n?: number }) {
  return (
    <div className="section__body" aria-busy="true">
      {Array.from({ length: n }, (_, i) => (
        <div className="row" key={i}>
          <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 18, width: '40%', marginTop: 4 }} />
            <div className="skeleton" style={{ height: 14, width: '80%', marginTop: 10 }} />
            <div className="skeleton" style={{ height: 12, width: '50%', marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
