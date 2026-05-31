import { useEffect, useState } from 'react'
import { api, portalTokenStorage, type PortalProfile } from '../lib/api'

type PortalAuthState = {
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
  user: PortalProfile | null
}

export function usePortalAuth(): PortalAuthState {
  const [token, setToken] = useState<string | null>(() => portalTokenStorage.get())
  const [user, setUser] = useState<PortalProfile | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    api
      .getPortalProfile(token)
      .then((profile) => {
        if (!cancelled) {
          setUser(profile)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((profileError: Error) => {
        if (!cancelled) {
          portalTokenStorage.clear()
          setToken(null)
          setUser(null)
          setError(profileError.message)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await api.portalLogin(email, password)
      portalTokenStorage.set(response.token)
      setToken(response.token)
      setUser(response.contact)
      setIsLoading(false)
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : 'Portal login failed'
      setError(message)
      setIsLoading(false)
      throw loginError
    }
  }

  const logout = () => {
    portalTokenStorage.clear()
    setToken(null)
    setUser(null)
    setError(null)
  }

  return {
    error,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    token,
    user,
  }
}
