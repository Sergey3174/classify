import type { Listing } from '../types'

/** Unsplash photo by id, sized for a phone screen. All mock imagery is stock, not real listings. */
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=75&auto=format&fit=crop`

const P = {
  ktm: u('1591637333184-19aa84b3e01f'),
  r6: u('1609630875171-b1321377ee65'),
  cruiser: u('1558981806-ec527fa84c39'),
  villa: u('1613490493576-7fde63acd811'),
  villa2: u('1600596542815-ffad4c1539a9'),
  living: u('1560448204-e02f11c3d0e2'),
  house: u('1600585154340-be6161a56a0c'),
  studio: u('1522708323590-d24dbb6b0267'),
  armchair: u('1586023492125-27b2c045efd7'),
  iphone: u('1695048133142-1a20484d2569'),
  macbook: u('1517336714731-489689fd1ca8'),
  code: u('1498050108023-c5249f4df085'),
  ps5: u('1606813907291-d86efa9b94db'),
  headphones: u('1505740420928-5e560c06d30e'),
  camera: u('1516035069371-29a1b244cc32'),
  watch: u('1523275335684-37898b6baf30'),
  surf: u('1502680390469-be75c86b636f'),
  board: u('1531722569936-825d3dd91b15'),
  bike: u('1485965120184-e220f721d03e'),
  sofa: u('1555041469-a586c61ea9bc'),
  chair: u('1592078615290-033ee584e267'),
  monstera: u('1614594975525-e45190c55d0b'),
  guitar: u('1510915361894-db8b60106cb1'),
  kitten: u('1592194996308-7b43878e84a6'),
  cat: u('1574158622682-e40e69881006'),
  jacket: u('1551028719-00167b16eac5'),
  bag: u('1591348278863-a8fb3887e2aa'),
  team: u('1519389950473-47ba0277781c'),
}

/** Photos the create wizard offers instead of a real camera roll (mock). */
export const pickerPhotos = [P.board, P.bike, P.chair, P.headphones, P.camera, P.watch]

const ago = (hours: number) => new Date(Date.UTC(2026, 9, 7, 12) - hours * 3600_000).toISOString()

export const listings: Listing[] = [
  {
    id: 'l1', title: 'Вилла 2 спальни с бассейном', price: 29_000_000, priceUnit: 'month', currency: 'IDR',
    categoryId: 'realty', cityId: 'bali', district: 'Чангу, Берава', distanceKm: 1.2,
    description: 'Вилла в тихом переулке, 5 минут до пляжа Берава. Две спальни с кондиционерами и своими ванными, кухня-гостиная, частный бассейн 3×6 м. Уборка дважды в неделю, интернет 100 Мбит, байк-парковка.',
    photos: [P.villa, P.villa2, P.living], sellerId: 'u2', createdAt: ago(5), views: 1204, favorites: 96, status: 'active', promoted: true,
    attributes: [{ label: 'Спальни', value: '2' }, { label: 'Площадь', value: '140 м²' }, { label: 'Срок аренды', value: 'от 1 месяца' }, { label: 'Бассейн', value: 'Частный' }, { label: 'Депозит', value: '1 месяц' }],
  },
  {
    id: 'l2', title: 'KTM 790 Duke, 2022', price: 118_000_000, currency: 'IDR',
    categoryId: 'transport', cityId: 'bali', district: 'Чангу', distanceKm: 0.8,
    description: 'Один владелец, пробег 9 300 км. Обслуживание по регламенту, свежая резина Pirelli. Документы BPKB и STNK на руках, перерегистрация у нотариуса.',
    photos: [P.ktm, P.cruiser], condition: 'used', sellerId: 'u1', createdAt: ago(2), views: 312, favorites: 18, status: 'active',
    attributes: [{ label: 'Год', value: '2022' }, { label: 'Пробег', value: '9 300 км' }, { label: 'Объём', value: '799 см³' }, { label: 'Документы', value: 'BPKB + STNK' }],
  },
  {
    id: 'l3', title: 'iPhone 15 Pro, 256 ГБ', price: 14_500_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Убуд', distanceKm: 24,
    description: 'Natural Titanium, куплен в iBox Денпасар год назад. Всегда в чехле и со стеклом, аккумулятор 91%. Полный комплект, коробка, чек.',
    photos: [P.iphone], condition: 'used', sellerId: 'u5', createdAt: ago(20), views: 540, favorites: 33, status: 'active',
    attributes: [{ label: 'Память', value: '256 ГБ' }, { label: 'Аккумулятор', value: '91%' }, { label: 'Комплект', value: 'Полный' }],
  },
  {
    id: 'l4', title: 'Уроки сёрфинга для новичков', price: 550_000, priceUnit: 'lesson', currency: 'IDR',
    categoryId: 'services', cityId: 'bali', district: 'Кута', distanceKm: 9.4,
    description: 'Индивидуальные и групповые занятия на пляже Кута. Доска и лайкра включены, видеоразбор после урока. Инструктор с сертификатом ISA, говорю по-русски.',
    photos: [P.surf, P.board], sellerId: 'u2', createdAt: ago(30), views: 410, favorites: 40, status: 'active',
    attributes: [{ label: 'Формат', value: 'Индивидуально или группа' }, { label: 'Длительность', value: '2 часа' }, { label: 'Уровень', value: 'С нуля' }],
  },
  {
    id: 'l5', title: 'MacBook Air M2, 16/512', price: 15_500_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Семиньяк', distanceKm: 6.1,
    description: 'Состояние идеальное, 42 цикла зарядки, без царапин. Продаю, потому что перешёл на 15". Могу встретиться в коворкинге Tropical Nomad.',
    photos: [P.macbook, P.code], condition: 'used', sellerId: 'u6', createdAt: ago(28), views: 288, favorites: 21, status: 'active', delivery: true,
    attributes: [{ label: 'Процессор', value: 'Apple M2' }, { label: 'Память', value: '16 ГБ' }, { label: 'SSD', value: '512 ГБ' }, { label: 'Циклы', value: '42' }],
  },
  {
    id: 'l6', title: 'Дом с садом, 3 спальни', price: 39_000_000, priceUnit: 'month', currency: 'IDR',
    categoryId: 'realty', cityId: 'bali', district: 'Берава', distanceKm: 2.3,
    description: 'Современный дом с садом и большой террасой. Три спальни, кабинет, закрытая территория. Подходит семье с детьми: рядом международная школа.',
    photos: [P.house, P.living, P.armchair], sellerId: 'u4', createdAt: ago(44), views: 760, favorites: 54, status: 'active',
    attributes: [{ label: 'Спальни', value: '3' }, { label: 'Площадь', value: '220 м²' }, { label: 'Срок аренды', value: 'от 6 месяцев' }],
  },
  {
    id: 'l7', title: 'PlayStation 5 Slim + 2 геймпада', price: 7_200_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Семиньяк', distanceKm: 5.6,
    description: 'Дисковая версия, гарантия до марта 2027. В комплекте EA FC 25 и Spider-Man 2.',
    photos: [P.ps5], condition: 'used', sellerId: 'u3', createdAt: ago(60), views: 233, favorites: 17, status: 'active',
    attributes: [{ label: 'Версия', value: 'С дисководом' }, { label: 'Гарантия', value: 'до 03.2027' }],
  },
  {
    id: 'l8', title: 'Диван, зелёный бархат', price: 3_900_000, currency: 'IDR',
    categoryId: 'home', cityId: 'bali', district: 'Санур', distanceKm: 17,
    description: 'Трёхместный, 210 см, бархат цвета бутылочного стекла. Переезжаем — отдаём со скидкой, самовывоз.',
    photos: [P.sofa], condition: 'used', sellerId: 'u5', createdAt: ago(70), views: 96, favorites: 5, status: 'active',
    attributes: [{ label: 'Ширина', value: '210 см' }, { label: 'Материал', value: 'Бархат' }],
  },
  {
    id: 'l9', title: 'Котята ищут дом', price: null, currency: 'IDR',
    categoryId: 'pets', cityId: 'bali', district: 'Чангу', distanceKm: 1.9,
    description: 'Два мальчика и девочка, 3 месяца. Приучены к лотку, обработаны от паразитов, первая прививка сделана. Отдадим в добрые руки.',
    photos: [P.kitten, P.cat], sellerId: 'u2', createdAt: ago(80), views: 455, favorites: 70, status: 'active',
    attributes: [{ label: 'Возраст', value: '3 месяца' }, { label: 'Прививки', value: 'Первая сделана' }],
  },
  {
    id: 'l10', title: 'Монстера в горшке, 1,2 м', price: 450_000, currency: 'IDR',
    categoryId: 'home', cityId: 'bali', district: 'Чангу', distanceKm: 1.4,
    description: 'Большая здоровая монстера, переезжаем — отдаём вместе с керамическим горшком.',
    photos: [P.monstera], sellerId: 'u1', createdAt: ago(96), views: 64, favorites: 6, status: 'active',
    attributes: [{ label: 'Высота', value: '1,2 м' }],
  },
  {
    id: 'l11', title: 'Sony WH-1000XM5', price: 3_700_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Убуд', distanceKm: 23,
    description: 'Шумоподавление, кейс, кабель. Покупал в дьюти-фри, носил пару месяцев.',
    photos: [P.headphones], condition: 'used', sellerId: 'u6', createdAt: ago(100), views: 120, favorites: 11, status: 'active', delivery: true,
    attributes: [{ label: 'Цвет', value: 'Чёрный' }],
  },
  {
    id: 'l12', title: 'Sony A7 III + 2 объектива', price: 18_000_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Семиньяк', distanceKm: 6.4,
    description: 'Пробег 18 тыс. кадров. Объективы 28–70 и 50 мм f/1.8, две батареи, зарядка.',
    photos: [P.camera], condition: 'used', sellerId: 'u4', createdAt: ago(110), views: 200, favorites: 15, status: 'active',
    attributes: [{ label: 'Пробег', value: '18 000 кадров' }, { label: 'Объективы', value: '28–70, 50/1.8' }],
  },
  {
    id: 'l13', title: 'Студия в центре, 24 м²', price: 17_000, priceUnit: 'month', currency: 'THB',
    categoryId: 'realty', cityId: 'bangkok', district: 'Сукхумвит', distanceKm: 0.6,
    description: 'Студия в кондоминиуме с бассейном и спортзалом на крыше, 5 минут до BTS Asok. Контракт от 6 месяцев.',
    photos: [P.studio, P.armchair], sellerId: 'u4', createdAt: ago(40), views: 760, favorites: 54, status: 'active',
    attributes: [{ label: 'Площадь', value: '24 м²' }, { label: 'Этаж', value: '18 из 32' }, { label: 'Срок аренды', value: 'от 6 месяцев' }],
  },
  {
    id: 'l14', title: 'Yamaha R6, 2021', price: 230_000, currency: 'THB',
    categoryId: 'transport', cityId: 'phuket', district: 'Карон', distanceKm: 3.2,
    description: 'Тайские номера, полная страховка, сервисная книжка. Возможен обмен на Honda ADV 160 с доплатой.',
    photos: [P.r6], condition: 'used', sellerId: 'u3', createdAt: ago(50), views: 205, favorites: 12, status: 'active',
    attributes: [{ label: 'Год', value: '2021' }, { label: 'Пробег', value: '12 400 км' }],
  },
  {
    id: 'l15', title: 'Ищу Frontend-разработчика (React)', price: 11_000, priceUnit: 'month', currency: 'AED',
    categoryId: 'jobs', cityId: 'dubai', district: 'Бизнес-Бэй', distanceKm: 2.1,
    description: 'Финтех-стартап ищет React-разработчика уровня middle+. Полная занятость, гибкий график, оплата в USDT. Можно удалённо.',
    photos: [P.team], sellerId: 'u4', createdAt: ago(55), views: 830, favorites: 61, status: 'active',
    attributes: [{ label: 'Занятость', value: 'Полная' }, { label: 'Формат', value: 'Офис или удалённо' }, { label: 'Опыт', value: 'от 3 лет' }],
  },
  {
    id: 'l16', title: 'Акустическая гитара Yamaha FG830', price: 600, currency: 'GEL',
    categoryId: 'hobby', cityId: 'tbilisi', district: 'Ваке', distanceKm: 1.1,
    description: 'Массив ели, отличный звук. Чехол и запасной комплект струн в подарок.',
    photos: [P.guitar], condition: 'used', sellerId: 'u6', createdAt: ago(75), views: 178, favorites: 15, status: 'active',
    attributes: [{ label: 'Дека', value: 'Массив ели' }],
  },
  {
    id: 'l17', title: 'Кожаная косуха, размер M', price: 320, currency: 'GEL',
    categoryId: 'clothes', cityId: 'tbilisi', district: 'Сабуртало', distanceKm: 3.5,
    description: 'Натуральная кожа, носил один сезон. Чёрная, молнии YKK.',
    photos: [P.jacket], condition: 'used', sellerId: 'u6', createdAt: ago(130), views: 120, favorites: 8, status: 'active',
    attributes: [{ label: 'Размер', value: 'M' }, { label: 'Материал', value: 'Кожа' }],
  },
  {
    id: 'l18', title: 'Велосипед fixed gear', price: 2_900_000, currency: 'IDR',
    categoryId: 'transport', cityId: 'bali', district: 'Санур', distanceKm: 16,
    description: 'Лёгкая стальная рама, новая цепь. Идеален для набережной Санура.',
    photos: [P.bike], condition: 'used', sellerId: 'u3', createdAt: ago(150), views: 74, favorites: 4, status: 'active',
    attributes: [{ label: 'Рама', value: 'Сталь, 54 см' }],
  },
  // объявления текущего пользователя в других статусах — для экрана «Мои объявления»
  {
    id: 'l19', title: 'Доска для сёрфинга 7\'2"', price: 3_600_000, currency: 'IDR',
    categoryId: 'hobby', cityId: 'bali', district: 'Чангу', distanceKm: 0.5,
    description: 'Фанборд для прогрессии, пара мелких сколов заделана.',
    photos: [P.board], condition: 'used', sellerId: 'u1', createdAt: ago(3), views: 0, favorites: 0, status: 'moderation',
    attributes: [{ label: 'Длина', value: '7\'2"' }],
  },
  {
    id: 'l20', title: 'Смарт-часы, белые', price: 1_450_000, currency: 'IDR',
    categoryId: 'electronics', cityId: 'bali', district: 'Чангу', distanceKm: 0.5,
    description: 'Продано.',
    photos: [P.watch], condition: 'used', sellerId: 'u1', createdAt: ago(700), views: 410, favorites: 22, status: 'archived',
    attributes: [],
  },
]
