/**
 * Mock API. Every function returns a Promise with an artificial delay so screens
 * already handle loading states. To connect a real backend, keep these signatures
 * and replace the bodies with fetch() calls (see README → «API-контракт»).
 */
import { listingAttributes } from '../data/categoryAttributes'
import { listings as seed } from '../mocks/listings'
import { alerts as seedAlerts } from '../mocks/alerts'
import { currencyOf } from '../mocks/reference'
import { ME_ID, reviews, userById } from '../mocks/users'
import type { Alert, AlertDraft, AlertSummary, Listing, ListingDraft, ListingFilters } from '../types'

const DELAY = 350
const wait = <T,>(value: T, ms = DELAY) => new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), ms))

let db: Listing[] = [...seed]
let alertsDb: Alert[] = [...seedAlerts]
/** «Ищу»: at most this many active alerts per person; alerts cannot be edited, only deleted. */
export const MAX_ACTIVE_ALERTS = 5
const ALERT_LIMIT_TEXT = `Можно держать не больше ${MAX_ACTIVE_ALERTS} активных уведомлений`
const activeAlerts = () => alertsDb.filter((a) => a.active).length
const NOW = () => new Date(Math.max(Date.now(), Date.UTC(2026, 9, 7, 12))).toISOString()

/** Every word of the query must appear in the title or description («macbook m2» finds «MacBook Air M2»). */
const matchesQuery = (l: Listing, q?: string) => {
  const words = q?.trim().toLowerCase().split(/\s+/).filter(Boolean) ?? []
  const text = `${l.title} ${l.description}`.toLowerCase()
  return words.every((w) => text.includes(w))
}

/** Listings an alert would have notified about: active, matching, published after the alert was created. */
const alertMatches = (a: Alert) =>
  db
    .filter(
      (l) =>
        l.status === 'active' &&
        l.cityId === a.cityId &&
        (!a.district || l.district?.includes(a.district)) &&
        (!a.categoryId || l.categoryId === a.categoryId) &&
        (!a.condition || l.condition === a.condition) &&
        (a.priceTo == null || (l.price != null && l.price <= a.priceTo)) &&
        matchesQuery(l, a.query) &&
        l.createdAt > a.createdAt,
    )
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt))

const summarize = (a: Alert): AlertSummary => {
  const m = alertMatches(a)
  return { ...a, matches: m.length, fresh: a.active ? m.filter((l) => l.createdAt > a.seenAt).length : 0 }
}

// Prices are compared as-is: listings are always filtered by city, and every listing in a
// city is priced in that country's currency, so filters and sorting need no conversion.
const price = (l: Listing) => l.price ?? 0

export const api = {
  async getListings(f: ListingFilters = {}): Promise<Listing[]> {
    let res = db.filter((l) => l.status === 'active' && matchesQuery(l, f.query))
    if (f.categoryId) res = res.filter((l) => l.categoryId === f.categoryId)
    if (f.cityId) res = res.filter((l) => l.cityId === f.cityId)
    if (f.district) res = res.filter((l) => l.district?.includes(f.district!))
    if (f.condition) res = res.filter((l) => l.condition === f.condition)
    if (f.withPhoto) res = res.filter((l) => l.photos.length > 0)
    if (f.delivery) res = res.filter((l) => l.delivery)
    if (f.priceFrom != null) res = res.filter((l) => l.price != null && l.price >= f.priceFrom!)
    if (f.priceTo != null) res = res.filter((l) => l.price != null && l.price <= f.priceTo!)
    const attributeFilters = listingAttributes(f.categoryId, f.attributes)
    const normalizeAttribute = (value: string) => value.trim().toLocaleLowerCase('ru-RU').replace(/\s+/g, '')
    if (attributeFilters.length) {
      res = res.filter((l) => attributeFilters.every((filter) => l.attributes.some(
        (attribute) => attribute.label === filter.label && normalizeAttribute(attribute.value) === normalizeAttribute(filter.value),
      )))
    }
    const sort = f.sort ?? 'new'
    res.sort((a, b) => {
      if (sort === 'cheap') return price(a) - price(b)
      if (sort === 'expensive') return price(b) - price(a)
      if (sort === 'near') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99)
      // «новые»: сначала поднятые (promoted), затем по дате
      return Number(!!b.promoted) - Number(!!a.promoted) || b.createdAt.localeCompare(a.createdAt)
    })
    return wait(res)
  },

  async getListing(id: string) {
    const l = db.find((x) => x.id === id)
    if (!l) throw new Error('Объявление не найдено')
    return wait({ listing: l, seller: userById(l.sellerId)! })
  },

  async getSimilar(listing: Listing) {
    return wait(db.filter((l) => l.id !== listing.id && l.status === 'active' && l.categoryId === listing.categoryId).slice(0, 6))
  },

  async getUser(id: string) {
    const user = userById(id)
    if (!user) throw new Error('Пользователь не найден')
    return wait({
      user,
      listings: db.filter((l) => l.sellerId === id && l.status === 'active'),
      reviews: reviews.filter((r) => r.sellerId === id),
    })
  },

  async getMyListings() {
    return wait(db.filter((l) => l.sellerId === ME_ID))
  },

  async getByIds(ids: string[]) {
    return wait(db.filter((l) => ids.includes(l.id)))
  },

  async createListing(d: ListingDraft): Promise<Listing> {
    const l: Listing = {
      id: `l${Date.now()}`,
      title: d.title.trim(),
      description: d.description.trim(),
      price: d.negotiable || !d.price ? null : Number(d.price),
      currency: currencyOf(d.cityId!),
      categoryId: d.categoryId!,
      cityId: d.cityId!,
      district: d.district || undefined,
      photos: d.photos,
      condition: d.condition,
      attributes: listingAttributes(d.categoryId, d.attributes),
      sellerId: ME_ID,
      createdAt: new Date().toISOString(),
      views: 0,
      favorites: 0,
      status: 'moderation',
      delivery: d.delivery,
    }
    db = [l, ...db]
    return wait(l, 800)
  },

  async setStatus(id: string, status: Listing['status']) {
    db = db.map((l) => (l.id === id ? { ...l, status } : l))
    return wait(true)
  },

  async promote(id: string) {
    db = db.map((l) => (l.id === id ? { ...l, promoted: true, createdAt: new Date().toISOString() } : l))
    return wait(true, 600)
  },

  /* ---------- «Ищу»: subscriptions to future listings ---------- */

  async getAlerts(): Promise<AlertSummary[]> {
    return wait(alertsDb.map(summarize))
  },

  /** Alert with its matches. Read-only: matches newer than `seenAt` are «новые». */
  async getAlert(id: string) {
    const a = alertsDb.find((x) => x.id === id)
    if (!a) throw new Error('Уведомление не найдено')
    return wait({ alert: summarize(a), listings: alertMatches(a) })
  },

  /** Called when the person leaves an alert they have seen: its matches stop being «новые». */
  async markAlertSeen(id: string) {
    alertsDb = alertsDb.map((x) => (x.id === id ? { ...x, seenAt: NOW() } : x))
    return wait(true, 0)
  },

  async createAlert(d: AlertDraft): Promise<Alert> {
    if (activeAlerts() >= MAX_ACTIVE_ALERTS) throw new Error(ALERT_LIMIT_TEXT)
    const now = NOW()
    const a: Alert = { ...d, query: d.query.trim(), id: `a${Date.now()}`, active: true, createdAt: now, seenAt: now }
    alertsDb = [a, ...alertsDb]
    return wait(a, 500)
  },

  async setAlertActive(id: string, active: boolean) {
    const current = alertsDb.find((x) => x.id === id)
    if (active && !current?.active && activeAlerts() >= MAX_ACTIVE_ALERTS) throw new Error(ALERT_LIMIT_TEXT)
    alertsDb = alertsDb.map((x) => (x.id === id ? { ...x, active } : x))
    return wait(true)
  },

  async deleteAlert(id: string) {
    alertsDb = alertsDb.filter((x) => x.id !== id)
    return wait(true)
  },

  /* ---------- KYC (identity check) of the signed-in user ---------- */

  async getKyc() {
    return wait(userById(ME_ID)!.kyc, 200)
  },

  /**
   * Mock: «documents sent» → pending, then approved a few seconds later.
   * The real provider, documents and storage are not decided yet.
   */
  async startKyc() {
    const me = userById(ME_ID)!
    me.kyc = 'pending'
    setTimeout(() => {
      if (me.kyc === 'pending') me.kyc = 'verified'
    }, 4000)
    return wait(me.kyc, 600)
  },

}
