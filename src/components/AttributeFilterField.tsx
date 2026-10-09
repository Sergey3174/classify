import { useId } from 'react'

/** Suggestions stay in the sheet layout, including while it scrolls. */
export function AttributeFilterField({ label, placeholder, value, options, onChange }: {
  label: string
  placeholder: string
  value: string
  options: string[]
  onChange(value: string): void
}) {
  const id = useId()
  return (
    <div className="cell attribute-filter">
      <div className="cell__body">
        <label className="cell__subtitle" htmlFor={id}>{label}</label>
        <input
          id={id}
          className="field"
          placeholder={placeholder}
          maxLength={120}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {options.length > 0 && (
          <div className="attribute-filter__suggestions" role="group" aria-label={`Подсказки: ${label}`}>
            {options.map((option) => (
              <button key={option} type="button" className="chip chip--quiet"
                aria-pressed={value === option} onClick={() => onChange(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}