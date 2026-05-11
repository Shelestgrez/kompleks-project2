import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiMe } from './api'
import type { User } from './types'

type AuthCtx = {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  refresh: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const t = localStorage.getItem('token')
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await apiMe()
      setUser(me)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback((t: string) => {
    localStorage.setItem('token', t)
    setToken(t)
    void refresh()
  }, [refresh])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const v = useMemo(
    () => ({ user, token, loading, login, logout, refresh }),
    [user, token, loading, login, logout, refresh],
  )

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useAuth() {
  const x = useContext(Ctx)
  if (!x) throw new Error('useAuth outside AuthProvider')
  return x
}
