import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { hotelApi } from '../api'
import type { HotelApi } from '../api'
import { clearToken, getToken, setToken } from '../api/session'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../api/types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login(body: LoginRequest): Promise<void>
  register(body: RegisterRequest): Promise<void>
  logout(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
  api?: HotelApi
}

/** Provider / Observer: components subscribe to the session and re-render when it changes. */
export function AuthProvider({ children, api = hotelApi }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(getToken() ? 'loading' : 'anonymous')

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .me()
      .then((current) => {
        if (cancelled) return
        setUser(current)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setStatus('anonymous')
      })
    return () => {
      cancelled = true
    }
  }, [api])

  const startSession = useCallback(({ token, user: nextUser }: AuthResponse) => {
    setToken(token)
    setUser(nextUser)
    setStatus('authenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login: async (body) => startSession(await api.login(body)),
      register: async (body) => startSession(await api.register(body)),
      logout: async () => {
        try {
          await api.logout()
        } finally {
          clearToken()
          setUser(null)
          setStatus('anonymous')
        }
      },
    }),
    [api, startSession, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
