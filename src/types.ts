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
  tint: string // фон плитки категории
}

export interface City {
  id: string
  title: string
  country: string
  districts: string[]
}

export interface User {
  id: string
  name: string
  username: string // Telegram @username — "Написать" opens a chat with it
  avatar: string
  city: string
  rating: number // 0..5
  reviewsCount: number
  registeredAt: string // ISO date
  verified: boolean
  responseTime: string // "обычно отвечает за 10 минут"
}

export type ListingStatus = 'active' | 'moderation' | 'archived' | 'rejected'
export type Condition = 'new' | 'used'

export interface Listing {
  id: string
  title: string
  description: string
  price: number | null // null = "Договорная"
  priceUnit?: 'month' | 'lesson' | 'hour'
  currency: 'RUB' | 'USD' | 'IDR'
  categoryId: CategoryId
  cityId: string
  district?: string
  distanceKm?: number // от пользователя; в проде считается по геолокации
  photos: string[]
  condition?: Condition
  attributes: { label: string; value: string }[]
  sellerId: string
  createdAt: string // ISO
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
  query?: string
  categoryId?: CategoryId
  cityId?: string
  priceFrom?: number
  priceTo?: number
  condition?: Condition
  withPhoto?: boolean
  delivery?: boolean
  sort?: SortOrder
}

/** Draft of a new listing while the user walks through the create wizard. */
export interface ListingDraft {
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
