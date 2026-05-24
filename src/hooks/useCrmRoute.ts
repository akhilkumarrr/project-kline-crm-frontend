import { useEffect, useState } from 'react'
import { buildHashRoute, readHashRouteState } from '../lib/navigation'

const readHashRoute = (fallback: string) => {
  return readHashRouteState().route || fallback
}

export function useCrmRoute(fallback: string) {
  const [route, setRoute] = useState(() => readHashRoute(fallback))

  useEffect(() => {
    const onHashChange = () => setRoute(readHashRoute(fallback))

    window.addEventListener('hashchange', onHashChange)

    if (!window.location.hash) {
      window.history.replaceState(null, '', `#/${fallback}`)
    }

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [fallback])

  const navigate = (nextRoute: string) => {
    if (nextRoute === route) {
      return
    }

    window.location.hash = buildHashRoute(nextRoute)
  }

  return { route, navigate }
}
