import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <p role="status" className="flex min-h-screen items-center justify-center text-sand/70">
        Verificando tu sesión...
      </p>
    )
  }
  if (status === 'anonymous') {
    return <Navigate to="/ingresar" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
