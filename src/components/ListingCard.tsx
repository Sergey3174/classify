import { Heart, Images, MapPin, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/app'
import type { Listing } from '../types'
import { formatDistance, formatPrice, formatUnit } from '../utils/format'

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

export function ListingCard({ l }: { l: Listing }) {
  return (
    <Link to={`/listing/${l.id}`} className="card">
      <div className="card__media">
        <img src={l.photos[0]} alt="" loading="lazy" />
        {l.promoted && (
          <span className="card__badge pill pill--glass">
            <Rocket size={10} strokeWidth={2.6} /> Поднято
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
      <div className="card__title">{l.title}</div>
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
        <div className="t-sub" style={{ marginTop: 1 }}>{l.title}</div>
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
          <div className="skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 16 }} />
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
