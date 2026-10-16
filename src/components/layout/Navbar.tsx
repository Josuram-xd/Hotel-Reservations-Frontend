import { Link, NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/buscar', label: 'Reservar', end: false },
]

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <nav
        aria-label="Navegación principal"
        className="flex items-center gap-2 rounded-full border border-white/15 bg-ink/60 px-3 py-2 backdrop-blur-xl"
      >
        <Link to="/" className="px-4 text-lg font-semibold tracking-wide text-sand">
          Hotel Aurora
        </Link>
        <ul className="flex items-center gap-1">
          {LINKS.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    isActive ? 'bg-gold text-ink' : 'text-sand hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
