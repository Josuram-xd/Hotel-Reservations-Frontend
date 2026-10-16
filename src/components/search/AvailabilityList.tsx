import type { AvailableRoom } from '../../api/types'
import Button from '../ui/Button'
import RoomResultCard from './RoomResultCard'

interface AvailabilityListProps {
  rooms: AvailableRoom[] | null
  loading: boolean
  error: string | null
  selectedId?: number | null
  onSelect?(room: AvailableRoom): void
  onRetry(): void
}

export default function AvailabilityList({
  rooms,
  loading,
  error,
  selectedId = null,
  onSelect,
  onRetry,
}: AvailabilityListProps) {
  if (loading) {
    return (
      <p role="status" className="py-16 text-center text-sand/70">
        Buscando habitaciones disponibles...
      </p>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-red-300">{error}</p>
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!rooms) return null

  if (rooms.length === 0) {
    return (
      <p className="py-16 text-center text-sand/70">
        No hay habitaciones disponibles para esas fechas. Prueba con otras fechas u otro tipo de habitación.
      </p>
    )
  }

  return (
    <div>
      <p className="mb-6 text-sand/70" aria-live="polite">
        {rooms.length} {rooms.length === 1 ? 'habitación disponible' : 'habitaciones disponibles'}
      </p>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomResultCard key={room.id} room={room} selected={room.id === selectedId} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  )
}
