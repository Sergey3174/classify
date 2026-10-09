import {
  Bell,
  Search as SearchIcon,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { CategoryIcon } from "../components/CategoryIcon";
import { AppBar, Empty } from "../components/Chrome";
import { CardSkeletons, ListingCard } from "../components/ListingCard";
import { AlertSheet, FilterSheet } from "../components/Sheets";
import { categories, cityById } from "../mocks/reference";
import { useApp } from "../store/useApp";
import type { CategoryId, ListingFilters } from "../types";
import { plural } from "../utils/format";
import { useAsync } from "../utils/useAsync";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const { location } = useApp();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [filters, setFilters] = useState<ListingFilters>({ sort: "new" });
  const [sheet, setSheet] = useState(false);
  const [alerting, setAlerting] = useState(false);
  const categoryId = (params.get("cat") as CategoryId | null) ?? undefined;
  const city = cityById(location.cityId);
  const categoryRow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = categoryRow.current;
    const selected = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !selected) return;

    const reveal = () => {
      const bounds = row.getBoundingClientRect();
      const tab = selected.getBoundingClientRect();
      const style = getComputedStyle(row);
      const left = bounds.left + row.clientLeft + parseFloat(style.paddingLeft);
      const right = bounds.left + row.clientLeft + row.clientWidth - parseFloat(style.paddingRight);
      const offset = tab.left < left ? tab.left - left : tab.right > right ? tab.right - right : 0;
      if (Math.abs(offset) > 1) {
        row.scrollBy({
          left: offset,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }
    // Check once per selection: swiping the category row must remain unrestricted.
    const observer = new IntersectionObserver(() => {
      observer.disconnect();
      reveal();
    }, { root: row, threshold: 1 });
    observer.observe(selected);
    return () => observer.disconnect();
  }, [categoryId]);

  const effective = useMemo<ListingFilters>(
    // search is limited to the chosen district (or the whole city when none is chosen)
    () => ({
      ...filters,
      query,
      categoryId,
      cityId: location.cityId,
      district: location.district ?? undefined,
    }),
    [filters, query, categoryId, location.cityId, location.district],
  );
  const { data, loading } = useAsync(
    () => api.getListings(effective),
    [JSON.stringify(effective)],
  );
  const items = data ?? [];

  const activeCount =
    [
      filters.priceFrom,
      filters.priceTo,
      filters.condition,
      filters.delivery,
      filters.withPhoto,
    ].filter((v) => v !== undefined).length +
    (filters.sort && filters.sort !== "new" ? 1 : 0);

  const setCategory = (id?: CategoryId) => {
    const next = new URLSearchParams(params);
    if (id) next.set("cat", id);
    else next.delete("cat");
    setParams(next, { replace: true });
  };

  return (
    <div className="page">
      <AppBar
        back
        flush
        title="Поиск"
        sub={[city?.title, location.district ?? "весь город"].join(" · ")}
      />

      <div ref={categoryRow} className="chips" style={{ paddingTop: 4 }}>
        <button
          type="button"
          className="chip"
          aria-pressed={!categoryId}
          onClick={() => setCategory(undefined)}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={categoryId === c.id}
            onClick={() => setCategory(c.id)}
          >
            {categoryId !== c.id && <CategoryIcon id={c.id} size={16} />}
            {c.title}
          </button>
        ))}
      </div>

      <div className="search__bar">
        <label className="searchfield">
          <SearchIcon size={17} strokeWidth={2.4} />
          <input
            autoFocus
            type="search"
            enterKeyHint="search"
            placeholder="Что ищете?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={() => setQuery("")}
              style={{ color: "var(--hint)", display: "grid" }}
            >
              <X size={16} strokeWidth={2.6} />
            </button>
          )}
        </label>
        <button
          type="button"
          className="search__filter"
          data-active={activeCount > 0}
          aria-label={`Фильтры${activeCount ? `: ${activeCount}` : ""}`}
          onClick={() => setSheet(true)}
        >
          <SlidersHorizontal size={17} strokeWidth={2.4} />
        </button>
      </div>

      <div className="search__summary">
        <span className="t-foot hint num">
          {loading
            ? "Ищем…"
            : `${items.length} ${plural(items.length, "объявление", "объявления", "объявлений")}`}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            className="t-foot"
            style={{ color: "var(--link)" }}
            onClick={() => setFilters({ sort: "new" })}
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* with no results the same action sits in the empty state instead */}
      {(query.trim().length >= 2 || categoryId) &&
        !loading &&
        items.length > 0 && (
          <div className="section">
            <div className="section__body">
              <button
                type="button"
                className="cell cell--icon alert-cta"
                onClick={() => setAlerting(true)}
              >
                <span className="tile-icon">
                  <Bell size={15} strokeWidth={2.4} />
                </span>
                <div className="cell__body">
                  <div className="cell__title">Уведомить о новых</div>
                  <div className="cell__subtitle">
                    {[
                      query.trim()
                        ? `«${query.trim()}»`
                        : categories.find((c) => c.id === categoryId)?.title,
                      city?.title,
                    ]
                      .filter(Boolean)
                      .join(" · ")}{" "}
                    — пришлём в бота
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

      {loading ? (
        <CardSkeletons />
      ) : items.length ? (
        <div className="grid">
          {items.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      ) : (
        <Empty
          icon={<SearchX size={30} />}
          title="Ничего не нашли"
          text={`${query ? `По запросу «${query}»` : "По этим фильтрам"} ${location.district ? `в районе ${location.district}` : "в этом городе"} пока нет объявлений. Попробуйте другое слово, уберите фильтры или выберите другой район на главной.`}
          action={
            <div style={{ display: "flex", gap: 8 }}>
              {(query.trim().length >= 2 || categoryId) && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setAlerting(true)}
                >
                  <Bell size={16} strokeWidth={2.4} /> Уведомить меня
                </button>
              )}
              <button
                type="button"
                className="btn btn--tinted"
                onClick={() => {
                  setQuery("");
                  setFilters({ sort: "new" });
                  setCategory(undefined);
                }}
              >
                Показать все
              </button>
            </div>
          }
        />
      )}

      {alerting && (
        <AlertSheet
          initial={{
            query,
            categoryId,
            cityId: location.cityId,
            district: location.district ?? undefined,
            priceTo: filters.priceTo,
            condition: filters.condition,
          }}
          onClose={() => setAlerting(false)}
        />
      )}
      {sheet && (
        <FilterSheet
          value={filters}
          onApply={setFilters}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}
