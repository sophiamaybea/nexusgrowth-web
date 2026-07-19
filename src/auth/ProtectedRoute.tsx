import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-nexus-black flex items-center justify-center">
        <div className="text-nexus-textMuted text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}
