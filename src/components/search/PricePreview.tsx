import type { AvailableRoom } from '../../api/types'
import { formatDate, ROOM_TYPE_LABELS, formatMoney } from '../../lib/format'
import { ButtonLink } from '../ui/Button'

interface PricePreviewProps {
  room: AvailableRoom
  checkIn: string
  checkOut: string
  /** Hide the "continue" link, e.g. when the preview is already inside the booking page. */
  showAction?: boolean
}

/** Shows the price computed by the server. The client never recalculates the total. */
export default function PricePreview({ room, checkIn, checkOut, showAction = true }: PricePreviewProps) {
  const standardNights = room.nights - room.highSeasonNights
  const query = new URLSearchParams({ roomId: String(room.id), checkIn, checkOut }).toString()

  return (
    <aside
      aria-label="Resumen de precio"
      className="rounded-3xl border border-gold/40 bg-gold/10 p-6 md:sticky md:top-28"
    >
      <h2 className="text-2xl font-medium">
        {ROOM_TYPE_LABELS[room.type]} · Habitación {room.number}
      </h2>
      <p className="mt-1 text-sm text-sand/70">
        {formatDate(checkIn)} al {formatDate(checkOut)}
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-sand/70">Precio base por noche</dt>
          <dd>{formatMoney(room.pricePerNight)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-sand/70">Noches en temporada regular</dt>
          <dd>{standardNights}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-sand/70">Noches en temporada alta (+50%)</dt>
          <dd>{room.highSeasonNights}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/15 pt-3 text-lg">
          <dt>Total estimado</dt>
          <dd className="font-medium text-gold">{formatMoney(room.totalPrice)}</dd>
        </div>
      </dl>
      {showAction && (
        <ButtonLink to={`/reservar?${query}`} className="mt-6 w-full">
          Continuar con la reserva
        </ButtonLink>
      )}
    </aside>
  )
}
