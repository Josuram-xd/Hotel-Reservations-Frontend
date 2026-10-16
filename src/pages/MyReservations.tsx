import { useApi } from '../api/ApiContext'
import { StatusBadge } from '../components/reservation/ReservationSummary'
import Button, { ButtonLink } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'
import { ROOM_TYPE_LABELS, formatDate, formatMoney } from '../lib/format'

export default function MyReservations() {
  const api = useApi()
  const loaded = useAsync(() => api.myReservations(), [api])

  let content
  if (loaded.loading) {
    content = (
      <p role="status" className="text-sand/70">
        Cargando tus reservas...
      </p>
    )
  } else if (loaded.error) {
    content = (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p className="text-red-300">{loaded.error}</p>
        <Button variant="secondary" onClick={loaded.reload}>
          Reintentar
        </Button>
      </div>
    )
  } else if (loaded.data && loaded.data.length === 0) {
    content = (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <p className="text-sand/70">Todavía no tienes reservas.</p>
        <ButtonLink to="/buscar">Buscar habitaciones</ButtonLink>
      </div>
    )
  } else if (loaded.data) {
    content = (
      <ul className="flex flex-col gap-4">
        {loaded.data.map((reservation) => (
          <li key={reservation.id}>
            <article
              aria-label={`Reserva ${reservation.id}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-sand/60">Código de reserva</p>
                  <p className="text-xl font-medium tracking-wide">{reservation.id}</p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-sand/60">Habitación</dt>
                  <dd>
                    {ROOM_TYPE_LABELS[reservation.room.type]} · {reservation.room.number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sand/60">Fechas</dt>
                  <dd>
                    {formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sand/60">Total</dt>
                  <dd className="text-gold">{formatMoney(reservation.total)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink to={`/reserva/${encodeURIComponent(reservation.id)}`} variant="secondary">
                  Gestionar
                </ButtonLink>
                {reservation.status === 'CHECKED_OUT' && (
                  <ButtonLink to={`/factura/${encodeURIComponent(reservation.id)}`} variant="ghost">
                    Ver factura
                  </ButtonLink>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pb-32 pt-40">
      <h1 className="mb-10 font-light" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
        Mis reservas
      </h1>
      {content}
    </section>
  )
}
