import { Archive, BadgeCheck, Bell, ChevronRight, Eye, Globe, Heart, LayoutList, LifeBuoy, MapPin, Rocket, RotateCcw, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { Empty, MainAction, Segmented, Switch, TopBar } from '../components/Chrome'
import { ListingCard, ListingRow, RowSkeletons } from '../components/ListingCard'
import { LocationSheet } from '../components/Sheets'
import { cityById } from '../mocks/reference'
import { ME_ID } from '../mocks/users'
import { useApp } from '../store/app'
import { haptic, openTelegramChat } from '../telegram/telegram'
import type { ListingStatus } from '../types'
import { formatAgo, formatSince, plural } from '../utils/format'
import { useAsync } from '../utils/useAsync'

export function Favorites() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite } = useApp()
  const { data, loading } = useAsync(() => api.getByIds(favorites), [favorites.join()])

  return (
    <div className="page page--grouped">
      <div className="create__title">
        <h1 className="t-large" style={{ margin: 0 }}>Избранное</h1>
      </div>
      <div className="section">
        {loading ? (
          <RowSkeletons />
        ) : data && data.length ? (
          <div className="section__body">
            {data.map((l) => (
              <ListingRow
                key={l.id}
                l={l}
                aside={
                  <button
                    type="button"
                    aria-label="Убрать из избранного"
                    style={{ alignSelf: 'center', color: '#ff3b5c', padding: 6 }}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(l.id)
                    }}
                  >
                    <Heart size={19} fill="currentColor" />
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <Empty
            icon={<Heart size={30} />}
            title="Пока ничего"
            text="Нажимайте на сердечко в объявлениях — они соберутся здесь, и мы сообщим, если цена снизится."
            action={<button type="button" className="btn btn--primary" onClick={() => navigate('/')}>Смотреть объявления</button>}
          />
        )}
      </div>
    </div>
  )
}

const tabs: { value: ListingStatus; label: string }[] = [
  { value: 'active', label: 'Активные' },
  { value: 'moderation', label: 'На проверке' },
  { value: 'archived', label: 'Архив' },
]

export function MyListings() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [tab, setTab] = useState<ListingStatus>('active')
  const [rev, setRev] = useState(0)
  const { data, loading } = useAsync(() => api.getMyListings(), [rev])
  const items = (data ?? []).filter((l) => l.status === tab)
  const count = (s: ListingStatus) => (data ?? []).filter((l) => l.status === s).length

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    haptic.success()
    await fn()
    setRev((r) => r + 1)
    showToast(msg)
  }

  return (
    <div className="page page--grouped">
      <div className="create__title">
        <h1 className="t-large" style={{ margin: 0 }}>Мои объявления</h1>
      </div>
      <div className="section">
        <Segmented<ListingStatus>
          value={tab}
          options={tabs.map((t) => ({ value: t.value, label: data ? `${t.label} ${count(t.value)}` : t.label }))}
          onChange={setTab}
        />
      </div>
      <div className="section">
        {loading ? (
          <RowSkeletons n={2} />
        ) : items.length ? (
          <div className="section__body">
            {items.map((l) => (
              <div key={l.id}>
                <ListingRow
                  l={l}
                  aside={
                    <span className="my__stats num">
                      <span><Eye size={13} /> {l.views}</span>
                      <span><Heart size={13} /> {l.favorites}</span>
                    </span>
                  }
                />
                <div className="my__actions">
                  {tab === 'active' && (
                    <>
                      <button type="button" className="btn btn--tinted btn--sm" onClick={() => act(() => api.promote(l.id), 'Объявление поднято в ленте')}>
                        <Rocket size={14} /> Поднять
                      </button>
                      <button type="button" className="btn btn--sm" style={{ background: 'var(--fill)' }} onClick={() => act(() => api.setStatus(l.id, 'archived'), 'Перенесено в архив')}>
                        <Archive size={14} /> В архив
                      </button>
                    </>
                  )}
                  {tab === 'moderation' && <span className="pill pill--warning">Проверяем · {formatAgo(l.createdAt)}</span>}
                  {tab === 'archived' && (
                    <button type="button" className="btn btn--tinted btn--sm" onClick={() => act(() => api.setStatus(l.id, 'active'), 'Объявление снова в ленте')}>
                      <RotateCcw size={14} /> Восстановить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            icon={<LayoutList size={30} />}
            title={tab === 'active' ? 'Нет активных объявлений' : tab === 'moderation' ? 'Ничего не ждёт проверки' : 'Архив пуст'}
            text={tab === 'active' ? 'Подайте объявление — это занимает пару минут.' : 'Здесь появятся объявления со статусом «' + tabs.find((t) => t.value === tab)!.label + '».'}
            action={tab === 'active' ? <button type="button" className="btn btn--primary" onClick={() => navigate('/create')}>Подать объявление</button> : undefined}
          />
        )}
      </div>
    </div>
  )
}

export function UserProfile() {
  const { id = '' } = useParams()
  const { data, loading } = useAsync(() => api.getUser(id), [id])

  if (loading || !data) {
    return (
      <div className="page page--grouped">
        <TopBar />
        <div className="profile__head">
          <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 160, height: 22, marginTop: 14 }} />
        </div>
      </div>
    )
  }

  const { user, listings, reviews } = data
  return (
    <div className="page page--grouped">
      <TopBar title={user.name} />
      <div className="profile__head">
        <img className="avatar" src={user.avatar} alt="" width={72} height={72} />
        <div className="profile__name t-title2">
          {user.name}
          {user.verified && <BadgeCheck size={18} color="var(--accent)" fill="var(--accent-soft)" />}
        </div>
        <div className="t-sub hint">
          {cityById(user.city)?.title} · на Classify с {formatSince(user.registeredAt)}
        </div>
      </div>

      <div className="section">
        <div className="section__body profile__stats">
          <div className="profile__stat">
            <div className="t-headline stars num" style={{ justifyContent: 'center' }}><Star size={16} fill="currentColor" />{user.rating.toLocaleString('ru-RU')}</div>
            <div className="t-cap hint">рейтинг</div>
          </div>
          <div className="profile__stat">
            <div className="t-headline num">{user.reviewsCount}</div>
            <div className="t-cap hint">{plural(user.reviewsCount, 'отзыв', 'отзыва', 'отзывов')}</div>
          </div>
          <div className="profile__stat">
            <div className="t-headline num">{listings.length}</div>
            <div className="t-cap hint">{plural(listings.length, 'объявление', 'объявления', 'объявлений')}</div>
          </div>
        </div>
        <div className="section__footer">{user.responseTime[0].toUpperCase() + user.responseTime.slice(1)}</div>
      </div>

      {listings.length > 0 && (
        <>
          <div className="section" style={{ marginBottom: 8 }}><div className="section__header">Объявления</div></div>
          <div className="grid" style={{ marginBottom: 24 }}>{listings.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </>
      )}

      {reviews.length > 0 && (
        <div className="section">
          <div className="section__header">Отзывы</div>
          <div className="section__body">
            {reviews.map((r) => (
              <div className="review" key={r.id}>
                <div className="review__head">
                  <img className="avatar" src={r.authorAvatar} alt="" width={32} height={32} />
                  <div style={{ flex: 1 }}>
                    <div className="t-sub" style={{ fontWeight: 600 }}>{r.authorName}</div>
                    <div className="t-cap hint">{formatAgo(r.createdAt)}</div>
                  </div>
                  <span className="stars t-foot num"><Star size={13} fill="currentColor" />{r.rating}</span>
                </div>
                <div className="t-sub">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MainAction text="Написать продавцу" onClick={() => openTelegramChat(user.username)} grouped />
    </div>
  )
}

export function Me() {
  const { location, favorites } = useApp()
  const [picking, setPicking] = useState(false)
  const [notify, setNotify] = useState(true)
  const me = useAsync(() => api.getUser(ME_ID), [])
  const mine = useAsync(() => api.getMyListings(), [])
  const user = me.data?.user

  return (
    <div className="page page--grouped">
      <TopBar title="Профиль" />
      <div className="profile__head">
        {user ? <img className="avatar" src={user.avatar} alt="" width={72} height={72} /> : <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%' }} />}
        <div className="profile__name t-title2">{user?.name ?? '…'}</div>
        <div className="t-sub hint">@{user?.username}</div>
      </div>

      <div className="section">
        <div className="section__body">
          <Link to="/my" className="cell cell--icon">
            <span className="tile-icon" style={{ background: '#007aff' }}><LayoutList size={15} /></span>
            <div className="cell__body cell__title">Мои объявления</div>
            <div className="cell__value num">{mine.data?.length ?? ''}</div>
            <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
          </Link>
          <Link to="/favorites" className="cell cell--icon">
            <span className="tile-icon" style={{ background: '#ff2d55' }}><Heart size={15} /></span>
            <div className="cell__body cell__title">Избранное</div>
            <div className="cell__value num">{favorites.length}</div>
            <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
          </Link>
        </div>
      </div>

      <div className="section">
        <div className="section__body">
          <button type="button" className="cell cell--icon" onClick={() => setPicking(true)}>
            <span className="tile-icon" style={{ background: '#34c759' }}><MapPin size={15} /></span>
            <div className="cell__body cell__title">Мой район</div>
            <div className="cell__value">{[cityById(location.cityId)?.title, location.district].filter(Boolean).join(', ')}</div>
            <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
          </button>
          <div className="cell cell--icon">
            <span className="tile-icon" style={{ background: '#ff9500' }}><Bell size={15} /></span>
            <div className="cell__body cell__title">Уведомления в боте</div>
            <Switch label="Уведомления" checked={notify} onChange={setNotify} />
          </div>
          <div className="cell cell--icon">
            <span className="tile-icon" style={{ background: '#5856d6' }}><Globe size={15} /></span>
            <div className="cell__body cell__title">Язык</div>
            <div className="cell__value">Русский</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__body">
          <button type="button" className="cell cell--icon" onClick={() => openTelegramChat('classify_support')}>
            <span className="tile-icon" style={{ background: '#8e8e93' }}><LifeBuoy size={15} /></span>
            <div className="cell__body cell__title">Поддержка</div>
            <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
          </button>
        </div>
        <div className="section__footer" style={{ textAlign: 'center', paddingTop: 16 }}>Classify · макет на моковых данных</div>
      </div>

      {picking && <LocationSheet onClose={() => setPicking(false)} />}
    </div>
  )
}
