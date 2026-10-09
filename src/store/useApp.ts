import { createContext, useContext } from "react";

/** App state contract and its hook; the provider lives in ./app.tsx (kept apart for React Fast Refresh). */

import type { Location } from "./locationSlice";
export type { Location } from "./locationSlice";

export interface AppState {
  location: Location;
  setLocation(l: Location): void;
  favorites: string[];
  isFavorite(id: string): boolean;
  toggleFavorite(id: string): void;
  toast: string | null;
  showToast(text: string): void;
}

export const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}
