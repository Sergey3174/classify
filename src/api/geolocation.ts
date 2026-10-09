import { axiosBaseQuery } from "./axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { cities } from "../mocks/reference";

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

/** Country-scoped aliases. Bali and Phuket cover the region used by our catalog. */
const matches = [
  {
    id: "bali",
    country: "ID",
    cities: ["bali", "denpasar", "ubud", "canggu", "kuta", "seminyak", "sanur"],
    regions: ["bali"],
  },
  {
    id: "phuket",
    country: "TH",
    cities: ["phuket", "patong", "karon", "rawai"],
    regions: ["phuket"],
  },
  {
    id: "bangkok",
    country: "TH",
    cities: ["bangkok", "krung thep maha nakhon"],
    regions: [],
  },
  { id: "dubai", country: "AE", cities: ["dubai"], regions: [] },
  { id: "tbilisi", country: "GE", cities: ["tbilisi"], regions: [] },
];

export function matchLocation(response: unknown): { cityId: string } | null {
  if (!response || typeof response !== "object") return null;
  const data = response as Record<string, unknown>;
  if (data.success !== true) return null;
  const match = matches.find(
    (m) =>
      m.country.toLowerCase() === normalize(data.country_code) &&
      (m.cities.includes(normalize(data.city)) ||
        m.regions.includes(normalize(data.region))),
  );
  return match && cities.some((c) => c.id === match.id)
    ? { cityId: match.id }
    : null;
}

export const geoApi = createApi({
  reducerPath: "geoApi",
  baseQuery: axiosBaseQuery({
    baseURL: "https://ipwho.is/",
    timeout: 8000,
    withCredentials: false,
  }),
  endpoints: (build) => ({
    detectLocation: build.query<{ cityId: string } | null, void>({
      query: () => "?fields=success,country_code,city,region",
      transformResponse: matchLocation,
      keepUnusedDataFor: 60,
    }),
  }),
});
export const { useDetectLocationQuery, useLazyDetectLocationQuery } = geoApi;
