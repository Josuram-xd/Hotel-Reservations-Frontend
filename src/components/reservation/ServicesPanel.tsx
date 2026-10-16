import { useState } from 'react'
import { useApi } from '../../api/ApiContext'
import { getErrorMessage } from '../../api/errors'
import type { Reservation, ServiceType } from '../../api/types'
import { SERVICE_LABELS, formatMoney } from '../../lib/format'

interface ServiceOption {
  type: ServiceType
  description: string
  cost(nights: number): number
}

const OPTIONS: ServiceOption[] = [
  { type: 'SPA', description: 'Sesión de spa', cost: () => 50 },
  { type: 'BREAKFAST', description: 'Desayuno todos los días de la estancia', cost: (nights) => 15 * nights },
  { type: 'TRANSFER', description: 'Traslado', cost: () => 30 },
]

interface ServicesPanelProps {
  reservation: Reservation
  onUpdated(reservation: Reservation): void
}

export default function ServicesPanel({ reservation, onUpdated }: ServicesPanelProps) {
  const api = useApi()
  const [pending, setPending] = useState<ServiceType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const closed = reservation.status === 'CHECKED_OUT'

  async function handleAdd(type: ServiceType) {
    setPending(type)
    setError(null)
    try {
      onUpdated(await api.addService(reservation.id, type))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setPending(null)
    }
  }

  return (
    <section aria-label="Servicios adicionales" className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <h2 className="text-2xl font-medium">Servicios adicionales</h2>
      <p className="mt-1 text-sm text-sand/60">
        {closed ? 'La estancia ya terminó, no se pueden agregar más servicios.' : 'Se suman al total de tu reserva.'}
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <li key={option.type} className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
            <div>
              <h3 className="font-medium">{SERVICE_LABELS[option.type]}</h3>
              <p className="text-sm text-sand/60">{option.description}</p>
            </div>
            <p className="text-gold">{formatMoney(option.cost(reservation.nights))}</p>
            <button
              type="button"
              disabled={closed || pending !== null}
              onClick={() => handleAdd(option.type)}
              aria-label={`Agregar ${SERVICE_LABELS[option.type]}`}
              className="mt-auto rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === option.type ? 'Agregando...' : 'Agregar'}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  )
}
