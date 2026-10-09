export type CategoryId =
  | 'transport'
  | 'realty'
  | 'electronics'
  | 'home'
  | 'clothes'
  | 'kids'
  | 'services'
  | 'jobs'
  | 'hobby'
  | 'pets'

export interface Category {
  id: CategoryId
  title: string
}

/** Each country has its own currency; a listing is priced in the currency of its city's country. */
export type Currency = 'IDR' | 'THB' | 'AED' | 'GEL'

export interface City {
  id: string
  title: string
  country: string
  currency: Currency
  districts: string[]
}

/** KYC — identity check. Only `verified` shows the «Личность подтверждена» mark. */
export type KycStatus = 'none' | 'pending' | 'verified'

export interface User {
  id: string
  name: string
  username: string // Telegram @username — "Написать" opens a chat with it
  avatar: string
  city: string
  rating: number // 0..5
  reviewsCount: number
  registeredAt: string // ISO date
  kyc: KycStatus // отметка «Личность подтверждена» — только при 'verified'
  lastSeenAt: string | null // ISO timestamp of last app activity; null if unknown
}

export type ListingStatus = 'active' | 'moderation' | 'archived' | 'rejected'
export type Condition = 'new' | 'used'

export interface Listing {
  id: string
  title: string
  description: string
  price: number | null // null = "Договорная"
  priceUnit?: 'month' | 'lesson' | 'hour'
  currency: Currency // always the currency of the city's country
  categoryId: CategoryId
  cityId: string
  district?: string
  distanceKm?: number // от пользователя; в проде считается по геолокации
  photos: string[]
  condition?: Condition
  attributes: { label: string; value: string }[]
  sellerId: string
  createdAt: string // ISO
  expiresAt?: string // ISO expiration date; assigned by the backend, demo dates in mocks
  views: number
  favorites: number
  status: ListingStatus
  promoted?: boolean // платное поднятие / VIP
  delivery?: boolean
}

export interface Review {
  id: string
  authorName: string
  authorAvatar: string
  sellerId: string
  rating: number
  text: string
  createdAt: string
}

export type SortOrder = 'new' | 'near' | 'cheap' | 'expensive'

export interface ListingFilters {
  attributes?: Record<string, string> // exact category attribute values; blank fields are ignored
  query?: string
  categoryId?: CategoryId
  cityId?: string
  district?: string // only this district; undefined = весь город
  priceFrom?: number
  priceTo?: number
  condition?: Condition
  withPhoto?: boolean
  delivery?: boolean
  sort?: SortOrder
}

/** Draft of a new listing while the user walks through the create wizard. */
export interface ListingDraft {
  attributes?: Record<string, string> // optional category-specific values
  categoryId?: CategoryId
  photos: string[]
  title: string
  description: string
  price: string
  negotiable: boolean
  condition?: Condition
  cityId?: string
  district: string
  delivery: boolean
}

/**
 * «Ищу» — saved search the user subscribes to. It is never published; when a matching
 * listing appears, the bot sends the user a message.
 */
export interface Alert {
  id: string
  query: string // «MacBook M2»; may be empty when a category is chosen
  categoryId?: CategoryId
  cityId: string
  district?: string // undefined = весь город
  priceTo?: number // in the currency of the alert's city
  condition?: Condition
  active: boolean // false = на паузе, уведомления не приходят
  createdAt: string // ISO; matches are listings published after this
  seenAt: string // ISO; matches published after this are «новые»
}

export type AlertDraft = Pick<Alert, 'query' | 'categoryId' | 'cityId' | 'district' | 'priceTo' | 'condition'>

export interface AlertSummary extends Alert {
  matches: number
  fresh: number // новые совпадения с последнего просмотра
}
