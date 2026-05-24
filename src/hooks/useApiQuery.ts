import { useEffect, useState } from 'react'

type ApiQueryState<T> = {
  data: T | null
  error: string | null
  loading: boolean
}

export function useApiQuery<T>(
  enabled: boolean,
  loader: () => Promise<T>,
  dependencies: readonly unknown[],
) {
  const [state, setState] = useState<ApiQueryState<T>>({
    data: null,
    error: null,
    loading: enabled,
  })

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false })
      return
    }

    let cancelled = false

    setState((current) => ({
      data: current.data,
      error: null,
      loading: true,
    }))

    loader()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, loading: false })
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error.message || 'Something went wrong',
            loading: false,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, ...dependencies])

  return state
}
