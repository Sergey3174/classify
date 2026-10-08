/**
 * Mock API. Every function returns a Promise with an artificial delay so screens
 * already handle loading states. To connect a real backend, keep these signatures
 * and replace the bodies with fetch() calls (see README → «API-контракт»).
 */
import { listings as seed } from "../mocks/listings";
import { ME_ID, reviews, userById } from "../mocks/users";
import type { Listing, ListingDraft, ListingFilters } from "../types";

const DELAY = 350;
const wait = <T>(value: T, ms = DELAY) =>
  new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), ms));

let db: Listing[] = [...seed];

const toUsd: Record<Listing["currency"], number> = {
  USD: 1,
  RUB: 1 / 85,
  IDR: 1 / 17900,
};
const usd = (l: Listing) => (l.price ?? 0) * toUsd[l.currency];

export const api = {
  async getListings(f: ListingFilters = {}): Promise<Listing[]> {
    const q = f.query?.trim().toLowerCase();
    let res = db.filter((l) => l.status === "active");
    if (q)
      res = res.filter((l) =>
        `${l.title} ${l.description}`.toLowerCase().includes(q),
      );
    if (f.categoryId) res = res.filter((l) => l.categoryId === f.categoryId);
    if (f.cityId) res = res.filter((l) => l.cityId === f.cityId);
    if (f.condition) res = res.filter((l) => l.condition === f.condition);
    if (f.withPhoto) res = res.filter((l) => l.photos.length > 0);
    if (f.delivery) res = res.filter((l) => l.delivery);
    if (f.priceFrom != null)
      res = res.filter((l) => l.price != null && usd(l) >= f.priceFrom!);
    if (f.priceTo != null)
      res = res.filter((l) => l.price != null && usd(l) <= f.priceTo!);
    const sort = f.sort ?? "new";
    res.sort((a, b) => {
      if (sort === "cheap") return usd(a) - usd(b);
      if (sort === "expensive") return usd(b) - usd(a);
      if (sort === "near") return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
      // «новые»: сначала поднятые (promoted), затем по дате
      return (
        Number(!!b.promoted) - Number(!!a.promoted) ||
        b.createdAt.localeCompare(a.createdAt)
      );
    });
    return wait(res);
  },

  async getListing(id: string) {
    const l = db.find((x) => x.id === id);
    if (!l) throw new Error("Объявление не найдено");
    return wait({ listing: l, seller: userById(l.sellerId)! });
  },

  async getSimilar(listing: Listing) {
    return wait(
      db
        .filter(
          (l) =>
            l.id !== listing.id &&
            l.status === "active" &&
            l.categoryId === listing.categoryId,
        )
        .slice(0, 6),
    );
  },

  async getUser(id: string) {
    const user = userById(id);
    if (!user) throw new Error("Пользователь не найден");
    return wait({
      user,
      listings: db.filter((l) => l.sellerId === id && l.status === "active"),
      reviews: reviews.filter((r) => r.sellerId === id),
    });
  },

  async getMyListings() {
    return wait(db.filter((l) => l.sellerId === ME_ID));
  },

  async getByIds(ids: string[]) {
    return wait(db.filter((l) => ids.includes(l.id)));
  },

  async createListing(d: ListingDraft): Promise<Listing> {
    const l: Listing = {
      id: `l${Date.now()}`,
      title: d.title.trim(),
      description: d.description.trim(),
      price: d.negotiable || !d.price ? null : Number(d.price),
      currency: "USD",
      categoryId: d.categoryId!,
      cityId: d.cityId!,
      district: d.district || undefined,
      distanceKm: 0,
      photos: d.photos,
      condition: d.condition,
      attributes: [],
      sellerId: ME_ID,
      createdAt: new Date().toISOString(),
      views: 0,
      favorites: 0,
      status: "moderation",
      delivery: d.delivery,
    };
    db = [l, ...db];
    return wait(l, 800);
  },

  async setStatus(id: string, status: Listing["status"]) {
    db = db.map((l) => (l.id === id ? { ...l, status } : l));
    return wait(true);
  },

  async promote(id: string) {
    db = db.map((l) =>
      l.id === id
        ? { ...l, promoted: true, createdAt: new Date().toISOString() }
        : l,
    );
    return wait(true, 600);
  },
};
