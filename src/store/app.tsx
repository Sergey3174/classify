import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { haptic } from "../telegram/telegram";

/** Per-device UI state. In production favorites and location would sync via the API / Telegram CloudStorage. */

interface Location {
  cityId: string;
  district: string | null; // null = весь город
}

interface AppState {
  location: Location;
  setLocation(l: Location): void;
  favorites: string[];
  isFavorite(id: string): boolean;
  toggleFavorite(id: string): void;
  toast: string | null;
  showToast(text: string): void;
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — state stays in memory */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLoc] = useState<Location>(() =>
    load("classify.location", { cityId: "bali", district: "Чангу" }),
  );
  const [favorites, setFavs] = useState<string[]>(() =>
    load("classify.favorites", ["l1", "l9"]),
  );
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const setLocation = useCallback((l: Location) => {
    setLoc(l);
    save("classify.location", l);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    haptic.tap();
    setFavs((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [id, ...prev];
      save("classify.favorites", next);
      return next;
    });
  }, []);

  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      location,
      setLocation,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      toast,
      showToast,
    }),
    [location, setLocation, favorites, toggleFavorite, toast, showToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}
