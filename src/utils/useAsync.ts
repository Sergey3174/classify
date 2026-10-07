import { useEffect, useState, type DependencyList } from 'react'

/** Minimal data hook for the mock API: { data, loading, error }. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fn().then(
      (data) => alive && setState({ data, loading: false, error: null }),
      (e: unknown) => alive && setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'Ошибка' }),
    )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
