import type { Category, City, Currency } from '../types'

export const categories: Category[] = [
  { id: 'realty', title: 'Жильё' },
  { id: 'transport', title: 'Транспорт' },
  { id: 'electronics', title: 'Техника' },
  { id: 'services', title: 'Услуги' },
  { id: 'home', title: 'Дом' },
  { id: 'jobs', title: 'Работа' },
  { id: 'clothes', title: 'Одежда' },
  { id: 'kids', title: 'Детям' },
  { id: 'hobby', title: 'Хобби' },
  { id: 'pets', title: 'Животные' },
]

export const cities: City[] = [
  { id: 'bali', title: 'Бали', country: 'Индонезия', currency: 'IDR', districts: ['Чангу', 'Берава', 'Семиньяк', 'Кута', 'Убуд', 'Санур', 'Улувату'] },
  { id: 'phuket', title: 'Пхукет', country: 'Таиланд', currency: 'THB', districts: ['Карон', 'Ката', 'Раваи', 'Патонг', 'Банг Тао'] },
  { id: 'bangkok', title: 'Бангкок', country: 'Таиланд', currency: 'THB', districts: ['Сукхумвит', 'Силом', 'Ари', 'Тонглор'] },
  { id: 'dubai', title: 'Дубай', country: 'ОАЭ', currency: 'AED', districts: ['Марина', 'Бизнес-Бэй', 'JLT', 'Даунтаун'] },
  { id: 'tbilisi', title: 'Тбилиси', country: 'Грузия', currency: 'GEL', districts: ['Ваке', 'Сабуртало', 'Ваке-Сабуртало', 'Старый город'] },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)
export const cityById = (id: string) => cities.find((c) => c.id === id)

/** Currency of the country the city is in (the only currency listings there are priced in). */
export const currencyOf = (cityId: string): Currency => cityById(cityId)?.currency ?? 'IDR'

export const currencies: Record<Currency, { symbol: string; name: string }> = {
  IDR: { symbol: 'Rp', name: 'индонезийских рупиях' },
  THB: { symbol: '฿', name: 'тайских батах' },
  AED: { symbol: 'AED', name: 'дирхамах ОАЭ' },
  GEL: { symbol: '₾', name: 'грузинских лари' },
}
