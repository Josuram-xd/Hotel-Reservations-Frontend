import { ButtonLink } from '../ui/Button'

export default function FinalCta() {
  return (
    <section className="px-6 py-32 text-center md:py-48">
      <h2
        className="mx-auto max-w-5xl font-light leading-tight tracking-tight"
        style={{ fontSize: 'clamp(2.25rem, 5vw, 5rem)' }}
      >
        Tu próxima estancia empieza con unas fechas
      </h2>
      <div className="mt-12 flex justify-center">
        <ButtonLink to="/buscar" variant="primary" className="px-10 py-5 text-lg">
          Buscar habitación
        </ButtonLink>
      </div>
    </section>
  )
}
