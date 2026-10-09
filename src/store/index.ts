import { configureStore } from "@reduxjs/toolkit";
import { geoApi } from "../api/geolocation";
import { loadLocation, locationReducer } from "./locationSlice";

export const store = configureStore({
  reducer: { location: locationReducer, [geoApi.reducerPath]: geoApi.reducer },
  preloadedState: { location: { selected: loadLocation() } },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(geoApi.middleware),
});

let previousLocation = store.getState().location.selected;
store.subscribe(() => {
  const location = store.getState().location.selected;
  if (location === previousLocation) return;
  previousLocation = location;
  try {
    localStorage.setItem("classify.location", JSON.stringify(location));
  } catch {
    /* State remains usable when browser storage is unavailable. */
  }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
