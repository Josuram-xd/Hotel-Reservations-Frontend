import { ButtonLink } from '../ui/Button'

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
      <img
        src="https://picsum.photos/seed/luxury-hotel-lobby/1920/1080"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60 contrast-125 grayscale"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,15,18,0.35)_0%,rgba(13,15,18,0.92)_75%)]"
      />
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-10 text-center">
        <h1
          className="w-full max-w-6xl font-light leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
        >
          Descansa donde la ciudad se detiene y cada detalle está resuelto para ti
        </h1>
        <p className="max-w-2xl text-lg text-sand/80">
          Reserva en minutos, elige tus servicios y haz tu check-in sin filas.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ButtonLink to="/buscar" variant="primary" className="px-8 py-4 text-base">
            Reservar ahora
          </ButtonLink>
          <a
            href="#habitaciones"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-medium text-white transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Ver habitaciones
          </a>
        </div>
      </div>
    </section>
  )
}
