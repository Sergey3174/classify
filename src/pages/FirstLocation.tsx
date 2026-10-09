import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { useDetectLocationQuery } from "../api/geolocation";
import { LocationSheet } from "../components/Sheets";
import type { Location } from "../store/locationSlice";

/** No saved location: detect once, then require a supported place from the picker. */
export function FirstLocation({ onDone }: { onDone(l: Location): void }) {
  const { data, isLoading, isError } = useDetectLocationQuery();
  useEffect(() => {
    if (data) onDone({ cityId: data.cityId, district: null, source: "auto" });
  }, [data, onDone]);
  const chooseManually = !isLoading && (isError || data === null);

  return (
    <div
      className="page page--flush first-loc first-loc--detecting"
      aria-busy={!chooseManually}
    >
      <div className="first-loc__icon">
        <MapPin size={30} />
      </div>
      <div className="t-title3">
        {chooseManually ? "Выберите город" : "Определяем город…"}
      </div>
      <div className="t-sub hint">
        {chooseManually
          ? "Не удалось найти ваше место среди доступных городов"
          : "Покажем объявления рядом с вами"}
      </div>
      {chooseManually && <LocationSheet required onClose={() => {}} />}
    </div>
  );
}
