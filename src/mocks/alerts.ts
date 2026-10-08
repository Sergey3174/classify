import type { Alert } from '../types'

const ago = (hours: number) => new Date(Date.UTC(2026, 9, 7, 12) - hours * 3600_000).toISOString()

/** Mock «Ищу» subscriptions of the signed-in user. Fictional, like all mocks. priceTo is in the city's currency. */
export const alerts: Alert[] = [
  // the example from the brief: nothing published yet — waiting
  { id: 'a1', query: 'MacBook M2', categoryId: 'electronics', cityId: 'bangkok', priceTo: 35_000, active: true, createdAt: ago(48), seenAt: ago(48) },
  { id: 'a2', query: '', categoryId: 'transport', cityId: 'bali', district: 'Чангу', priceTo: 130_000_000, active: true, createdAt: ago(24), seenAt: ago(24) },
  { id: 'a3', query: 'Sony', categoryId: 'electronics', cityId: 'bali', active: true, createdAt: ago(120), seenAt: ago(105) },
  { id: 'a4', query: 'Диван', categoryId: 'home', cityId: 'bali', active: false, createdAt: ago(200), seenAt: ago(200) },
]
