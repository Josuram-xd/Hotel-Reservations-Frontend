import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-2xl font-semibold">Hotel Aurora</p>
          <p className="mt-2 text-sm text-sand/60">Tu estancia, resuelta en minutos.</p>
        </div>
        <ul className="flex gap-6 text-sm text-sand/80">
          <li>
            <Link to="/" className="hover:text-gold">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/buscar" className="hover:text-gold">
              Reservar
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
