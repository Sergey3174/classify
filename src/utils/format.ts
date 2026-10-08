import { currencies } from '../mocks/reference'
import type { Currency, Listing } from '../types'

const nbsp = ' '

function group(n: number) {
  return Math.round(n).toLocaleString('ru-RU').replace(/\s/g, nbsp)
}

/** Price in the listing's own (country) currency: «29 млн Rp», «17 000 ฿», «11 000 AED», «600 ₾», or «Договорная». */
export function formatPrice(l: Pick<Listing, 'price' | 'currency'>) {
  if (l.price == null) return 'Договорная'
  return formatMoney(l.price, l.currency)
}

export function formatMoney(p: number, currency: Currency) {
  if (currency === 'IDR') {
    // rupiah: millions / thousands read better than seven-digit numbers
    if (p >= 1_000_000) {
      const m = (p / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
      return `${m}${nbsp}млн${nbsp}Rp`
    }
    if (p >= 1000) return `${group(p / 1000)}${nbsp}тыс${nbsp}Rp`
  }
  return `${group(p)}${nbsp}${currencies[currency].symbol}`
}

export function formatUnit(l: Pick<Listing, 'priceUnit' | 'price'>) {
  if (l.price == null) return ''
  const units = { month: '/мес', lesson: '/урок', hour: '/час' } as const
  return l.priceUnit ? units[l.priceUnit] : ''
}

export function formatDistance(km?: number) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000 / 50) * 50}${nbsp}м`
  return `${km.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}${nbsp}км`
}

const NOW = Date.UTC(2026, 9, 7, 12) // mock "now" so relative times stay stable

export function formatAgo(iso: string) {
  const diffMin = Math.max(0, Math.round((Math.min(Date.now(), NOW + 3600_000 * 24) - Date.parse(iso)) / 60000))
  if (diffMin < 60) return diffMin <= 1 ? 'только что' : `${diffMin}${nbsp}мин назад`
  const h = Math.round(diffMin / 60)
  if (h < 24) return `${h}${nbsp}ч назад`
  const d = Math.round(h / 24)
  if (d === 1) return 'вчера'
  if (d < 7) return `${d}${nbsp}${plural(d, 'день', 'дня', 'дней')} назад`
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export function formatCount(n: number) {
  return n.toLocaleString('ru-RU').replace(/\s/g, nbsp)
}

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/** «ноября 2024» — for «на Classify с …» */
export function formatSince(isoDate: string) {
  const d = new Date(isoDate)
  return `${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`
}

/** Glue a number to a short unit after it («24 м²», «5 мин») so the unit never wraps alone. */
export function typo(text: string) {
  return text.replace(/(\d) (?=[^\s\d]{1,4}(?:[\s,.)]|$))/g, `$1${nbsp}`)
}
