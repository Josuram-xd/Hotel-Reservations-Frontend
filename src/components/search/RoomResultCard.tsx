import type { AvailableRoom } from '../../api/types'
import { ROOM_TYPE_LABELS, formatMoney } from '../../lib/format'

interface RoomResultCardProps {
  room: AvailableRoom
  selected?: boolean
  onSelect?(room: AvailableRoom): void
}

export default function RoomResultCard({ room, selected = false, onSelect }: RoomResultCardProps) {
  return (
    <li
      className={`flex flex-col gap-4 rounded-3xl border p-6 transition-colors duration-300 ${
        selected ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-medium">{ROOM_TYPE_LABELS[room.type]}</h3>
          <p className="text-sm text-sand/60">Habitación {room.number}</p>
        </div>
        <p className="text-right">
          <span className="block text-2xl text-gold">{formatMoney(room.totalPrice)}</span>
          <span className="text-sm text-sand/60">
            {room.nights} {room.nights === 1 ? 'noche' : 'noches'}
          </span>
        </p>
      </div>
      <p className="text-sm text-sand/70">
        Desde {formatMoney(room.pricePerNight)} por noche
        {room.highSeasonNights > 0 &&
          ` · ${room.highSeasonNights} ${room.highSeasonNights === 1 ? 'noche' : 'noches'} en temporada alta`}
      </p>
      {onSelect && (
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(room)}
          className={`mt-auto rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
            selected ? 'bg-gold text-ink' : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {selected ? 'Seleccionada' : `Seleccionar habitación ${room.number}`}
        </button>
      )}
    </li>
  )
}
