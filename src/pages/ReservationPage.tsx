import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Reservation } from '../api/types'
import ReservationSummary from '../components/reservation/ReservationSummary'
import ServicesPanel from '../components/reservation/ServicesPanel'
import Button, { ButtonLink } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'

export default function ReservationPage() {
  const api = useApi()
  const { id = '' } = useParams()
  const loaded = useAsync(() => api.getReservation(id), [api, id])
  const [reservation, setReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    if (loaded.data) setReservation(loaded.data)
  }, [loaded.data])

  let content
  if (loaded.loading && !reservation) {
    content = (
      <p role="status" className="text-sand/70">
        Cargando tu reserva...
      </p>
    )
  } else if (loaded.error && !reservation) {
    content = (
      <div role="alert" className="flex flex-col items-start gap-4">
        <p className="text-red-300">{loaded.error}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loaded.reload}>
            Reintentar
          </Button>
          <ButtonLink to="/mis-reservas" variant="ghost">
            Ir a mis reservas
          </ButtonLink>
        </div>
      </div>
    )
  } else if (reservation) {
    content = (
      <div className="flex flex-col gap-8">
        <ReservationSummary reservation={reservation} />
        <ServicesPanel reservation={reservation} onUpdated={setReservation} />
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pb-32 pt-40">
      <h1 className="mb-10 font-light" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
        Tu reserva
      </h1>
      {content}
    </section>
  )
}
