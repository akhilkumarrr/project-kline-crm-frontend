import { useEffect, useState } from 'react'

const readHashRoute = (fallback: string) => {
  const raw = window.location.hash.replace(/^#\/?/, '').trim()
  return raw.split('?')[0] || fallback
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

    window.location.hash = `/${nextRoute}`
  }

  return { route, navigate }
}
