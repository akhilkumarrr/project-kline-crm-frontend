import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, tokenStorage, type CurrentUser } from '../lib/api'

type AuthContextValue = {
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
  user: CurrentUser | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [user, setUser] = useState<CurrentUser | null>(null)
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
      .getProfile(token)
      .then((profile) => {
        if (!cancelled) {
          setUser(profile)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((profileError: Error) => {
        if (!cancelled) {
          tokenStorage.clear()
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
      const response = await api.login(email, password)
      tokenStorage.set(response.token)
      setToken(response.token)
      setUser({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
        permissions: response.permissions,
      })
      setIsLoading(false)
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : 'Login failed'
      setError(message)
      setIsLoading(false)
      throw loginError
    }
  }

  const logout = () => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        error,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
