import { userReducer } from "./userSlice";
import { configureStore } from "@reduxjs/toolkit";
import { backendApi } from "../api/backend";
import { geoApi } from "../api/geolocation";
import { loadLocation, locationReducer } from "./locationSlice";

export const store = configureStore({
  reducer: {
    location: locationReducer,
    user: userReducer,
    [geoApi.reducerPath]: geoApi.reducer,
    [backendApi.reducerPath]: backendApi.reducer,
  },
  preloadedState: { location: { selected: loadLocation() } },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(geoApi.middleware, backendApi.middleware),
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
