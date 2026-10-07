import type { Category, City } from '../types'

export const categories: Category[] = [
  { id: 'realty', title: 'Жильё', tint: '#e8f1ff' },
  { id: 'transport', title: 'Транспорт', tint: '#fff1e3' },
  { id: 'electronics', title: 'Техника', tint: '#eeebff' },
  { id: 'services', title: 'Услуги', tint: '#e5f7ef' },
  { id: 'home', title: 'Дом', tint: '#fdeef3' },
  { id: 'jobs', title: 'Работа', tint: '#eef2f6' },
  { id: 'clothes', title: 'Одежда', tint: '#fff6dc' },
  { id: 'kids', title: 'Детям', tint: '#e6f6fb' },
  { id: 'hobby', title: 'Хобби', tint: '#f2ecff' },
  { id: 'pets', title: 'Животные', tint: '#ffefe6' },
]

export const cities: City[] = [
  { id: 'bali', title: 'Бали', country: 'Индонезия', districts: ['Чангу', 'Берава', 'Семиньяк', 'Кута', 'Убуд', 'Санур', 'Улувату'] },
  { id: 'phuket', title: 'Пхукет', country: 'Таиланд', districts: ['Карон', 'Ката', 'Раваи', 'Патонг', 'Банг Тао'] },
  { id: 'bangkok', title: 'Бангкок', country: 'Таиланд', districts: ['Сукхумвит', 'Силом', 'Ари', 'Тонглор'] },
  { id: 'dubai', title: 'Дубай', country: 'ОАЭ', districts: ['Марина', 'Бизнес-Бэй', 'JLT', 'Даунтаун'] },
  { id: 'tbilisi', title: 'Тбилиси', country: 'Грузия', districts: ['Ваке', 'Сабуртало', 'Ваке-Сабуртало', 'Старый город'] },
  { id: 'istanbul', title: 'Стамбул', country: 'Турция', districts: ['Бешикташ', 'Кадыкёй', 'Шишли'] },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)
export const cityById = (id: string) => cities.find((c) => c.id === id)
