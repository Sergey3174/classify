import { useEffect, useRef, useState, type DependencyList } from 'react'

/**
 * Minimal data hook for the mock API: { data, loading, error }.
 * Refetches when `deps` change (compared by value), always calling the latest `fn`.
 * `loading` is derived — true until a result for the current deps arrives; the previous
 * data stays visible meanwhile.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  })
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  })

  useEffect(() => {
    let alive = true
    fnRef.current().then(
      (data) => alive && setState({ key, data, error: null }),
      (e: unknown) => alive && setState({ key, data: null, error: e instanceof Error ? e.message : 'Ошибка' }),
    )
    return () => {
      alive = false
    }
  }, [key])

  return { data: state.data, loading: state.key !== key, error: state.key === key ? state.error : null }
}
