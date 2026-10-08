import {
  ChevronRight,
  Clock,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { categoryById, cityById } from "../mocks/reference";
import { AppBar, Empty, MainAction } from "../components/Chrome";
import { KycMark } from "../components/Kyc";
import { ListingCard } from "../components/ListingCard";
import { useApp } from "../store/useApp";
import { haptic, openTelegramChat } from "../telegram/telegram";
import {
  formatAgo,
  formatCount,
  formatDistance,
  formatPrice,
  formatUnit,
  plural,
} from "../utils/format";
import { useAsync } from "../utils/useAsync";

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  return (
    <div className="gallery">
      <div
        className="gallery__track"
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) {
            haptic.select();
            setIndex(i);
          }
        }}
      >
        {photos.map((src, i) => (
          <img key={src} src={src} alt={`${title}, фото ${i + 1}`} />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="gallery__dots" aria-hidden>
          {photos.map((p, i) => (
            <span key={p} data-on={i === index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Listing() {
  const { id = "" } = useParams();
  const { isFavorite, toggleFavorite, showToast } = useApp();
  const { data, loading, error } = useAsync(() => api.getListing(id), [id]);
  const similar = useAsync(
    () => (data ? api.getSimilar(data.listing) : Promise.resolve([])),
    [data?.listing.id],
  );

  if (loading) {
    return (
      <div className="page page--grouped">
        <AppBar back flush title="Объявление" sub="Загружаем…" />
        <div
          className="skeleton"
          style={{ aspectRatio: "1 / 1", borderRadius: 0 }}
        />
        <div style={{ padding: 16, background: "var(--section)" }}>
          <div className="skeleton" style={{ height: 30, width: "45%" }} />
          <div
            className="skeleton"
            style={{ height: 20, width: "80%", marginTop: 12 }}
          />
          <div
            className="skeleton"
            style={{ height: 14, width: "55%", marginTop: 12 }}
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <AppBar back title="Объявление" />
        <Empty
          icon={<Flag size={30} />}
          title="Объявление не найдено"
          text="Возможно, его уже сняли с публикации или продали."
        />
      </div>
    );
  }

  const { listing: l, seller } = data;
  const fav = isFavorite(l.id);
  const write = () => {
    haptic.tap();
    openTelegramChat(seller.username);
  };
  const share = async () => {
    const url = `${window.location.origin}/listing/${l.id}`;
    try {
      if (navigator.share) await navigator.share({ title: l.title, url });
      else {
        await navigator.clipboard.writeText(url);
        showToast("Ссылка скопирована");
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  return (
    <div className="page page--grouped">
      <AppBar
        back
        flush
        title={l.title}
        sub={[cityById(l.cityId)?.title, l.district]
          .filter(Boolean)
          .join(" · ")}
      />
      <Gallery photos={l.photos} title={l.title} />

      <div className="listing__head">
        <div className="listing__price num">
          {formatPrice(l)}
          <small>{formatUnit(l) && ` ${formatUnit(l)}`}</small>
        </div>
        <h1 className="listing__title">{l.title}</h1>
        <div className="listing__where">
          <MapPin size={14} strokeWidth={2.2} />
          <span>
            <b>{l.district}</b>
            {l.distanceKm ? ` · ${formatDistance(l.distanceKm)} от вас` : ""}
          </span>
        </div>

        <div className="actions listing__actions">
          <button
            type="button"
            className="action action--primary"
            onClick={write}
          >
            <span className="action__circle">
              <MessageCircle size={19} strokeWidth={2.4} />
            </span>
            Написать
          </button>
          <button
            type="button"
            className="action"
            onClick={() => toggleFavorite(l.id)}
            aria-pressed={fav}
          >
            <span className="action__circle">
              <Heart
                size={19}
                strokeWidth={2.4}
                fill={fav ? "currentColor" : "none"}
              />
            </span>
            {fav ? "В избранном" : "Сохранить"}
          </button>
          <button type="button" className="action" onClick={share}>
            <span className="action__circle">
              <Share2 size={18} strokeWidth={2.4} />
            </span>
            Поделиться
          </button>
          <button
            type="button"
            className="action"
            onClick={() => showToast("Жалоба отправлена модератору")}
          >
            <span className="action__circle">
              <Flag size={18} strokeWidth={2.4} />
            </span>
            Жалоба
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section__header">Описание</div>
        <div className="section__body section__body--pad listing__desc">
          {l.description}
        </div>
      </div>

      <div className="section">
        <div className="section__header">Подробности</div>
        <div className="section__body">
          <div className="cell">
            <div className="cell__body cell__title">Категория</div>
            <div className="cell__value">
              {categoryById(l.categoryId)?.title}
            </div>
          </div>
          {l.condition && (
            <div className="cell">
              <div className="cell__body cell__title">Состояние</div>
              <div className="cell__value">
                {l.condition === "new" ? "Новое" : "Б/у"}
              </div>
            </div>
          )}
          {l.attributes.map((a) => (
            <div className="cell" key={a.label}>
              <div className="cell__body cell__title">{a.label}</div>
              <div className="cell__value">{a.value}</div>
            </div>
          ))}
          {l.delivery && (
            <div className="cell">
              <Truck size={18} color="var(--success)" />
              <div className="cell__body cell__title">Есть доставка</div>
            </div>
          )}
        </div>
        <div className="section__footer num">
          {[
            `Опубликовано ${formatAgo(l.createdAt)}`,
            `${formatCount(l.views)} ${plural(l.views, "просмотр", "просмотра", "просмотров")}`,
          ]
            .map((part) => part.replace(/ /g, "\u00a0"))
            .join(" · ")}
        </div>
      </div>

      <div className="section">
        <div className="section__header">Продавец</div>
        <div className="section__body">
          <Link to={`/user/${seller.id}`} className="cell">
            <img
              className="avatar"
              src={seller.avatar}
              alt=""
              width={36}
              height={36}
            />
            <div className="cell__body">
              <div
                className="cell__title"
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                {seller.name}
                <KycMark user={seller} />
              </div>
              <div
                className="cell__subtitle"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span className="stars num">
                  <Star size={13} fill="currentColor" />
                  {seller.rating.toLocaleString("ru-RU")}
                </span>
                · {seller.reviewsCount}{" "}
                {plural(seller.reviewsCount, "отзыв", "отзыва", "отзывов")}
              </div>
            </div>
            <ChevronRight size={18} className="cell__chev" strokeWidth={2.4} />
          </Link>
          {seller.kyc === "verified" && (
            <div className="cell">
              <ShieldCheck size={16} color="var(--success)" />
              <div className="cell__body t-sub">Личность подтверждена</div>
            </div>
          )}
          <div className="cell">
            <Clock size={16} color="var(--hint)" />
            <div className="cell__body t-sub hint">
              {seller.responseTime[0].toUpperCase() +
                seller.responseTime.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {similar.data && similar.data.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section" style={{ marginBottom: 0 }}>
            <div className="section__header">Похожие рядом</div>
          </div>
          <div className="hscroll">
            {similar.data.map((s) => (
              <div className="mini" key={s.id}>
                <ListingCard l={s} />
              </div>
            ))}
          </div>
        </div>
      )}

      <MainAction text="Написать продавцу" onClick={write} grouped />
    </div>
  );
}
