import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { cities } from "../mocks/reference";

export interface Location {
  cityId: string;
  district: string | null;
  source?: "auto" | "manual";
}

export function validateLocation(value: unknown): Location | null {
  if (!value || typeof value !== "object" || !("cityId" in value)) return null;
  const city = cities.find((c) => c.id === value.cityId);
  if (!city) return null;
  const district =
    "district" in value &&
    typeof value.district === "string" &&
    city.districts.includes(value.district)
      ? value.district
      : null;
  const source =
    "source" in value && value.source === "auto" ? "auto" : "manual";
  return { cityId: city.id, district, source };
}

export function loadLocation(): Location | null {
  try {
    return validateLocation(
      JSON.parse(localStorage.getItem("classify.location") ?? "null"),
    );
  } catch {
    return null;
  }
}

const locationSlice = createSlice({
  name: "location",
  initialState: { selected: null as Location | null },
  reducers: {
    setLocation(state, action: PayloadAction<Location>) {
      const location = validateLocation(action.payload);
      if (location) state.selected = location;
    },
  },
});
export const { setLocation } = locationSlice.actions;
export const locationReducer = locationSlice.reducer;
