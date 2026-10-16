import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
    isActive ? 'bg-gold text-ink' : 'text-sand hover:bg-white/10'
  }`

export default function Navbar() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout().catch(() => undefined)
    navigate('/')
  }

  return (
    <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <nav
        aria-label="Navegación principal"
        className="flex max-w-full flex-wrap items-center justify-center gap-1 rounded-3xl border border-white/15 bg-ink/60 px-3 py-2 backdrop-blur-xl sm:rounded-full"
      >
        <Link to="/" className="px-4 text-lg font-semibold tracking-wide text-sand">
          Hotel Aurora
        </Link>
        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink to="/" end className={linkClass}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/buscar" className={linkClass}>
              Reservar
            </NavLink>
          </li>
          {status === 'authenticated' ? (
            <>
              <li>
                <NavLink to="/mis-reservas" className={linkClass}>
                  Mis reservas
                </NavLink>
              </li>
              <li className="flex items-center gap-2 pl-2">
                <span className="hidden text-sm text-sand/70 md:inline">{user?.fullName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-sand transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold"
                >
                  Salir
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/ingresar" className={linkClass}>
                Ingresar
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
