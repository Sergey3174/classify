import type { Review, User } from "../types";

const avatar = (seed: string) => `https://i.pravatar.cc/160?u=${seed}`;

/** The signed-in user (in production this comes from Telegram initData). */
export const ME_ID = "u1";

// Demo activity timestamps, unrelated to Telegram online status.
const lastSeen = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const users: User[] = [
  // the signed-in user starts without KYC, so the flow in «Мой профиль → Проверка личности» can be tried
  {
    id: "u1",
    name: "Павел",
    username: "pavel_dev",
    avatar: avatar("pavel"),
    city: "bali",
    rating: 4.9,
    reviewsCount: 23,
    registeredAt: "2025-03-12",
    kyc: "none",
    lastSeenAt: lastSeen(10),
  },
  {
    id: "u2",
    name: "Анна Смирнова",
    username: "anna_sm",
    avatar: avatar("anna"),
    city: "bali",
    rating: 4.8,
    reviewsCount: 41,
    registeredAt: "2024-11-02",
    kyc: "verified",
    lastSeenAt: lastSeen(60),
  },
  {
    id: "u3",
    name: "Игорь",
    username: "igor_moto",
    avatar: avatar("igor"),
    city: "phuket",
    rating: 4.6,
    reviewsCount: 12,
    registeredAt: "2025-06-20",
    kyc: "none",
    lastSeenAt: lastSeen(1440),
  },
  {
    id: "u4",
    name: "Studio Rent",
    username: "studio_rent",
    avatar: avatar("studio"),
    city: "bangkok",
    rating: 5,
    reviewsCount: 87,
    registeredAt: "2023-08-15",
    kyc: "verified",
    lastSeenAt: lastSeen(5),
  },
  {
    id: "u5",
    name: "Мария К.",
    username: "maria_k",
    avatar: avatar("maria"),
    city: "moscow",
    rating: 4.3,
    reviewsCount: 7,
    registeredAt: "2026-01-09",
    kyc: "none",
    lastSeenAt: lastSeen(120),
  },
  {
    id: "u6",
    name: "Дмитрий",
    username: "dima_tech",
    avatar: avatar("dima"),
    city: "minsk",
    rating: 4.7,
    reviewsCount: 19,
    registeredAt: "2025-02-28",
    kyc: "verified",
    lastSeenAt: lastSeen(30),
  },
];

export const userById = (id: string) => users.find((u) => u.id === id);

export const reviews: Review[] = [
  {
    id: "r1",
    sellerId: "u2",
    authorName: "Олег",
    authorAvatar: avatar("oleg"),
    rating: 5,
    text: "Всё как в описании, быстро договорились о встрече.",
    createdAt: "2026-09-28",
  },
  {
    id: "r2",
    sellerId: "u2",
    authorName: "Лена",
    authorAvatar: avatar("lena"),
    rating: 5,
    text: "Отличный продавец, рекомендую!",
    createdAt: "2026-09-11",
  },
  {
    id: "r3",
    sellerId: "u2",
    authorName: "Артём",
    authorAvatar: avatar("artem"),
    rating: 4,
    text: "Немного задержалась с ответом, но в целом всё ок.",
    createdAt: "2026-08-30",
  },
  {
    id: "r4",
    sellerId: "u4",
    authorName: "Ксения",
    authorAvatar: avatar("ks"),
    rating: 5,
    text: "Квартира чистая, хозяин на связи 24/7.",
    createdAt: "2026-09-20",
  },
  {
    id: "r5",
    sellerId: "u1",
    authorName: "Сергей",
    authorAvatar: avatar("serg"),
    rating: 5,
    text: "Байк в идеальном состоянии, спасибо!",
    createdAt: "2026-09-02",
  },
  {
    id: "r6",
    sellerId: "u3",
    authorName: "Ира",
    authorAvatar: avatar("ira"),
    rating: 4,
    text: "Нормально, торговаться не любит.",
    createdAt: "2026-07-14",
  },
];
