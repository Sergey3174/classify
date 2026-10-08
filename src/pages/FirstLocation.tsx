import { ChevronRight, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { cities } from '../mocks/reference'
import type { Location } from '../store/useApp'
import { haptic } from '../telegram/telegram'

/**
 * First launch: the place is detected by IP; if that fails, the person picks a country and city.
 * Shown by AppProvider instead of the app until a place is set.
 */
export function FirstLocation({ onDone }: { onDone(l: Location): void }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    api.detectLocation().then((res) => {
      if (!alive) return
      // IP gives a city at best — start with the whole city
      if (res) onDone({ cityId: res.cityId, district: null, source: 'auto' })
      else setFailed(true)
    })
    return () => {
      alive = false
    }
  }, [onDone])

  if (!failed) {
    return (
      <div className="page page--flush first-loc first-loc--detecting" aria-busy="true">
        <div className="first-loc__icon"><MapPin size={30} /></div>
        <div className="t-title3">Определяем город…</div>
        <div className="t-sub hint">Покажем объявления рядом с вами</div>
      </div>
    )
  }

  const countries = [...new Set(cities.map((c) => c.country))]
  return (
    <div className="page page--grouped page--flush">
      <header className="appbar">
        <div className="appbar__side" />
        <div className="appbar__center">
          <h1 className="appbar__title">Где вы?</h1>
          <span className="appbar__sub">Выберите страну и город</span>
        </div>
        <div className="appbar__side" />
      </header>

      <div className="first-loc__note t-sub hint">
        Не получилось определить город автоматически. Выберите его — поменять можно в любой момент в шапке главной.
      </div>

      {countries.map((country) => (
        <div className="section" key={country}>
          <div className="section__header">{country}</div>
          <div className="section__body">
            {cities
              .filter((c) => c.country === country)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="cell cell--icon"
                  onClick={() => {
                    haptic.success()
                    onDone({ cityId: c.id, district: null, source: 'manual' })
                  }}
                >
                  <span className="place-row__pin"><MapPin size={15} /></span>
                  <div className="cell__body cell__title">{c.title}</div>
                  <ChevronRight size={18} strokeWidth={2.4} className="cell__chev" />
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
