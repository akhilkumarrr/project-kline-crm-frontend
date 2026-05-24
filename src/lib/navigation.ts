export type RouteParams = Record<string, string | number | boolean | null | undefined>

export type HashRouteState = {
  params: URLSearchParams
  route: string
}

export const readHashRouteState = (): HashRouteState => {
  const raw = window.location.hash.replace(/^#\/?/, '').trim()
  const [routePart, query = ''] = raw.split('?')

  return {
    params: new URLSearchParams(query),
    route: routePart || '',
  }
}

export const readHashParam = (name: string) => readHashRouteState().params.get(name)

export const buildHashRoute = (route: string, params: RouteParams = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    search.set(key, String(value))
  })

  const query = search.toString()
  return `/${route}${query ? `?${query}` : ''}`
}

export const navigateToRoute = (route: string, params: RouteParams = {}) => {
  window.location.hash = buildHashRoute(route, params)
}

export const replaceHashRoute = (route: string, params: RouteParams = {}) => {
  window.history.replaceState(null, '', `#${buildHashRoute(route, params)}`)
}
