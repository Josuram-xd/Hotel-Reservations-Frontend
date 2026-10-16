import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import { getErrorMessage } from '../api/errors'
import type { Guest } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import GuestForm from '../components/booking/GuestForm'
import PricePreview from '../components/search/PricePreview'
import { ButtonLink } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'
import { nightsBetween, todayIso } from '../lib/dates'

export default function Booking() {
  const api = useApi()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const roomId = Number(params.get('roomId'))
  const checkIn = params.get('checkIn') ?? ''
  const checkOut = params.get('checkOut') ?? ''
  const validQuery = Number.isInteger(roomId) && roomId > 0 && checkIn >= todayIso() && nightsBetween(checkIn, checkOut) >= 1

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const availability = useAsync(
    () => (validQuery ? api.getAvailability({ checkIn, checkOut }) : Promise.resolve(null)),
    [api, validQuery, checkIn, checkOut],
  )
  const room = availability.data?.find((candidate) => candidate.id === roomId) ?? null

  async function handleSubmit(guest: Guest) {
    setSubmitting(true)
    setServerError(null)
    try {
      const reservation = await api.createReservation({ roomId, checkIn, checkOut, guest })
      navigate(`/reserva/${encodeURIComponent(reservation.id)}`, { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  const backToSearch = (
    <ButtonLink to="/buscar" variant="secondary" className="mt-6">
      Volver a la búsqueda
    </ButtonLink>
  )

  let content
  if (!validQuery) {
    content = (
      <div role="alert">
        <p className="text-red-300">Faltan datos para continuar con la reserva o las fechas no son válidas.</p>
        {backToSearch}
      </div>
    )
  } else if (availability.loading) {
    content = (
      <p role="status" className="text-sand/70">
        Cargando tu habitación...
      </p>
    )
  } else if (availability.error) {
    content = (
      <div role="alert">
        <p className="text-red-300">{availability.error}</p>
        {backToSearch}
      </div>
    )
  } else if (!room) {
    content = (
      <div role="alert">
        <p className="text-red-300">
          La habitación ya no está disponible para esas fechas. Elige otra opción para continuar.
        </p>
        {backToSearch}
      </div>
    )
  } else {
    content = (
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="mb-6 text-2xl font-medium">Datos del huésped</h2>
          <GuestForm
            initial={{ fullName: user?.fullName, email: user?.email }}
            submitting={submitting}
            serverError={serverError}
            onSubmit={handleSubmit}
          />
          <p className="mt-6 text-sm text-sand/60">
            <Link to="/buscar" className="underline-offset-4 hover:underline">
              Cambiar habitación o fechas
            </Link>
          </p>
        </div>
        <PricePreview room={room} checkIn={checkIn} checkOut={checkOut} showAction={false} />
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-32 pt-40">
      <h1 className="mb-10 font-light" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
        Completa tu reserva
      </h1>
      {content}
    </section>
  )
}
