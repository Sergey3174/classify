import {
  Bell,
  BellOff,
  ChevronRight,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, MAX_ACTIVE_ALERTS } from "../api";
import { CategoryTile } from "../components/CategoryIcon";
import { AppBar, Empty, Switch } from "../components/Chrome";
import { ListingCard } from "../components/ListingCard";
import { AlertSheet } from "../components/Sheets";
import { categoryById, cityById, currencyOf } from "../mocks/reference";
import { useApp } from "../store/useApp";
import { confirmDialog, haptic } from "../telegram/telegram";
import type { Alert } from "../types";
import { formatMoney, plural } from "../utils/format";
import { useAsync } from "../utils/useAsync";

/** «MacBook M2» or, for a category-only alert, the category name. */
const alertTitle = (a: Alert) =>
  a.query || categoryById(a.categoryId ?? "")?.title || "Всё подряд";

/** «Бангкок, Сукхумвит · Техника · до 35 000 ฿ · б/у» */
function alertWhere(a: Alert, withCategory = true) {
  return [
    [cityById(a.cityId)?.title, a.district].filter(Boolean).join(", "),
    withCategory && a.query && a.categoryId
      ? categoryById(a.categoryId)?.title
      : null,
    a.priceTo != null
      ? `до ${formatMoney(a.priceTo, currencyOf(a.cityId))}`
      : null,
    a.condition ? (a.condition === "new" ? "новое" : "б/у") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function AlertIcon({ a }: { a: Alert }) {
  if (!a.active) {
    return (
      <span className="tile-icon" style={{ background: "var(--tile-gray)" }}>
        <BellOff size={15} />
      </span>
    );
  }
  return a.categoryId ? (
    <CategoryTile id={a.categoryId} />
  ) : (
    <span className="tile-icon" style={{ background: "var(--tile-blue)" }}>
      <Search size={15} />
    </span>
  );
}

export function Alerts() {
  const [rev, setRev] = useState(0);
  const [creating, setCreating] = useState(false);
  const { data, loading } = useAsync(() => api.getAlerts(), [rev]);
  const items = data ?? [];
  const active = items.filter((a) => a.active).length;

  return (
    <div className="page page--grouped">
      <AppBar
        title="Уведомления"
        sub={
          data
            ? items.length
              ? `${active} из ${MAX_ACTIVE_ALERTS} активных`
              : "пока нет"
            : "Загружаем…"
        }
        right={
          <button
            type="button"
            className="appbar__side"
            aria-label="Создать уведомление"
            onClick={() => setCreating(true)}
          >
            <Plus size={22} strokeWidth={2} />
          </button>
        }
      />

      {loading && !data ? (
        <div className="section">
          <div className="section__body">
            {[0, 1, 2].map((i) => (
              <div className="cell" key={i}>
                <div
                  className="skeleton"
                  style={{ width: 26, height: 26, borderRadius: 7 }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{ height: 14, width: "45%" }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 12, width: "70%", marginTop: 6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : items.length ? (
        <>
          <div className="section">
            <div className="section__body">
              {items.map((a) => (
                <Link
                  key={a.id}
                  to={`/alerts/${a.id}`}
                  className="cell cell--icon"
                  data-paused={!a.active}
                >
                  <AlertIcon a={a} />
                  <div className="cell__body">
                    <div className="cell__title">{alertTitle(a)}</div>
                    <div className="cell__subtitle">{alertWhere(a)}</div>
                  </div>
                  {!a.active ? (
                    <span className="cell__value hint">пауза</span>
                  ) : a.fresh ? (
                    <span className="pill pill--accent num">
                      {a.fresh} {plural(a.fresh, "новое", "новых", "новых")}
                    </span>
                  ) : (
                    <span className="cell__value hint num">
                      {a.matches ? a.matches : "ждём"}
                    </span>
                  )}
                  <ChevronRight
                    size={18}
                    strokeWidth={2.4}
                    className="cell__chev"
                  />
                </Link>
              ))}
            </div>
            <div className="section__footer">
              Как только опубликуют подходящее объявление, бот пришлёт
              сообщение. Ваши «ищу» никто не видит. Активных — не больше{" "}
              {MAX_ACTIVE_ALERTS}; изменить уведомление нельзя, только удалить и
              создать новое.
            </div>
          </div>
          <div className="section">
            <button
              type="button"
              className="btn btn--tinted btn--block"
              onClick={() => setCreating(true)}
            >
              <Bell size={16} strokeWidth={2.4} /> Новое уведомление
            </button>
          </div>
        </>
      ) : (
        <Empty
          icon={<Bell size={30} />}
          title="Сообщим, когда появится"
          text="Опишите, что ищете — например, MacBook M2 в Бангкоке. Объявление никто не увидит, а когда кто-то опубликует подходящее, бот пришлёт сообщение."
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setCreating(true)}
            >
              Создать уведомление
            </button>
          }
        />
      )}

      {creating && (
        <AlertSheet
          onClose={() => setCreating(false)}
          onCreated={() => setRev((r) => r + 1)}
        />
      )}
    </div>
  );
}

export function AlertDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { data, loading, error } = useAsync(() => api.getAlert(id), [id]);
  const [active, setActive] = useState<boolean | null>(null);

  // matches become «seen» when the person leaves the screen after it was shown —
  // so the «Новое» badges stay while they are looking at them
  const shown = useRef(false);
  useEffect(() => {
    if (data) shown.current = true;
  }, [data]);
  useEffect(() => {
    const seen = shown;
    return () => {
      if (seen.current) api.markAlertSeen(id);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page page--grouped">
        <AppBar back title="Уведомление" sub="Загружаем…" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="page">
        <AppBar back title="Уведомление" />
        <Empty
          icon={<BellOff size={30} />}
          title="Уведомление не найдено"
          text="Возможно, вы его уже удалили."
        />
      </div>
    );
  }

  const { alert: a, listings } = data;
  const on = active ?? a.active;
  const toggle = async (v: boolean) => {
    haptic.select();
    setActive(v);
    try {
      await api.setAlertActive(a.id, v);
      showToast(v ? "Уведомления включены" : "Уведомления на паузе");
    } catch (e) {
      // over the limit of active alerts: switch back
      haptic.error();
      setActive(!v);
      showToast(e instanceof Error ? e.message : "Не получилось");
    }
  };
  const remove = async () => {
    if (!(await confirmDialog("Удалить уведомление?"))) return;
    haptic.success();
    await api.deleteAlert(a.id);
    showToast("Уведомление удалено");
    navigate("/alerts", { replace: true });
  };

  return (
    <div className="page page--grouped">
      <AppBar back title={alertTitle(a)} sub={alertWhere(a)} />

      <div className="section">
        <div className="section__body">
          <div className="cell">
            <div className="cell__body">
              <div className="cell__title">Присылать в бота</div>
              <div className="cell__subtitle">
                {on
                  ? "Сообщим о каждом новом объявлении"
                  : "На паузе — сообщения не приходят"}
              </div>
            </div>
            <Switch
              label="Присылать уведомления"
              checked={on}
              onChange={toggle}
            />
          </div>
        </div>
      </div>

      <div className="section" style={{ marginBottom: 8 }}>
        <div className="section__header section__header--row">
          <span>Совпадения</span>
          {listings.length > 0 && (
            <span className="num">{listings.length}</span>
          )}
        </div>
      </div>
      {listings.length ? (
        <div className="grid" style={{ marginBottom: 24 }}>
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              l={l}
              isNew={a.active && l.createdAt > a.seenAt}
            />
          ))}
        </div>
      ) : (
        <Empty
          icon={<Bell size={30} />}
          title="Пока ничего"
          text={`Как только опубликуют «${alertTitle(a)}» (${alertWhere(a, false)}), пришлём сообщение в бота.`}
        />
      )}

      <div className="section">
        <div className="section__body">
          <button
            type="button"
            className="cell"
            onClick={remove}
            style={{ color: "var(--destructive)" }}
          >
            <Trash2 size={18} />
            <div className="cell__body cell__title">Удалить уведомление</div>
          </button>
        </div>
        <div className="section__footer">
          Уведомление нельзя изменить. Чтобы изменить условия поиска, удалите
          уведомление и создайте новое.
        </div>
      </div>
    </div>
  );
}
