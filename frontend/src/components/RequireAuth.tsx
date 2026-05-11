import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
        Загрузка…
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  return <>{children}</>
}
