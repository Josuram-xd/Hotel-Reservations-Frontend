import { useState } from 'react'
import { useApi } from '../../api/ApiContext'
import { getErrorMessage } from '../../api/errors'
import type { Reservation } from '../../api/types'
import Button, { ButtonLink } from '../ui/Button'

interface StayActionsProps {
  reservation: Reservation
  onUpdated(reservation: Reservation): void
}

export default function StayActions({ reservation, onUpdated }: StayActionsProps) {
  const api = useApi()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingCheckOut, setConfirmingCheckOut] = useState(false)

  async function run(action: () => Promise<Reservation>) {
    setBusy(true)
    setError(null)
    try {
      onUpdated(await action())
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="Estancia" className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-2xl font-medium">Tu estancia</h2>

      {reservation.status === 'CONFIRMED' && (
        <div className="mt-4 flex flex-col items-start gap-4">
          <p className="text-sand/70">Cuando llegues al hotel, haz tu check-in para recibir tu llave digital.</p>
          <Button loading={busy} onClick={() => run(() => api.checkIn(reservation.id))}>
            Hacer check-in
          </Button>
        </div>
      )}

      {reservation.status === 'CHECKED_IN' && (
        <div className="mt-4 flex flex-col items-start gap-4">
          {reservation.digitalKey && (
            <>
              <p className="text-sand/70">Check-in realizado. Esta es la llave digital de tu habitación:</p>
              <p
                aria-label="Llave digital"
                className="break-all rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 font-mono text-lg text-gold"
              >
                {reservation.digitalKey}
              </p>
            </>
          )}
          {confirmingCheckOut ? (
            <div role="group" aria-label="Confirmar check-out" className="flex flex-col gap-3">
              <p className="text-sand/80">
                Se cobrarán los servicios adicionales y se generará tu factura final. ¿Quieres continuar?
              </p>
              <div className="flex gap-3">
                <Button
                  loading={busy}
                  onClick={() =>
                    run(async () => {
                      const updated = await api.checkOut(reservation.id)
                      setConfirmingCheckOut(false)
                      return updated
                    })
                  }
                >
                  Confirmar check-out
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => setConfirmingCheckOut(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmingCheckOut(true)}>
              Hacer check-out
            </Button>
          )}
        </div>
      )}

      {reservation.status === 'CHECKED_OUT' && (
        <div className="mt-4 flex flex-col items-start gap-4">
          <p className="text-sand/70">Check-out realizado. Gracias por quedarte con nosotros.</p>
          <ButtonLink to={`/factura/${encodeURIComponent(reservation.id)}`}>Ver factura</ButtonLink>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  )
}
