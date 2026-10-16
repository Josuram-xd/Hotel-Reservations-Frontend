import { Link } from 'react-router-dom'
import type { RoomType } from '../../api/types'
import { ROOM_TYPE_LABELS } from '../../lib/format'

interface RoomCard {
  type: RoomType
  image: string
  description: string
  from: string
  /** 4-column grid: Suite 2x2, Doble 2x1, Sencilla 2x1 = 8 cells = 4 cols x 2 rows. */
  span: string
}

const ROOMS: RoomCard[] = [
  {
    type: 'SUITE',
    image: 'https://picsum.photos/seed/penthouse-suite/1200/1200',
    description: 'Sala independiente, vista panorámica y la cama más cómoda del hotel.',
    from: '$180',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    type: 'DOUBLE',
    image: 'https://picsum.photos/seed/double-bedroom/1200/800',
    description: 'Dos camas o cama king, ideal para viajar en pareja o con amigos.',
    from: '$90',
    span: 'md:col-span-2 md:row-span-1',
  },
  {
    type: 'SINGLE',
    image: 'https://picsum.photos/seed/single-bedroom/1200/800',
    description: 'Compacta y luminosa, perfecta para viajes de trabajo.',
    from: '$60',
    span: 'md:col-span-2 md:row-span-1',
  },
]

export default function RoomsBento() {
  return (
    <section id="habitaciones" className="mx-auto max-w-7xl px-6 py-32 md:py-48">
      <h2
        className="mb-16 max-w-4xl font-light leading-tight tracking-tight"
        style={{ fontSize: 'clamp(2rem, 4vw, 3.75rem)' }}
      >
        Tres formas de quedarte, una sola de sentirte en casa
      </h2>
      <div className="grid grid-flow-dense grid-cols-1 gap-4 md:h-[44rem] md:grid-cols-4 md:grid-rows-2">
        {ROOMS.map((room) => (
          <Link
            key={room.type}
            to="/buscar"
            className={`group relative isolate flex min-h-72 overflow-hidden rounded-3xl border border-white/10 ${room.span}`}
          >
            <img
              src={room.image}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80 contrast-110 grayscale-[40%] transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"
            />
            <div className="mt-auto flex w-full flex-col gap-2 p-8">
              <h3 className="text-3xl font-medium">{ROOM_TYPE_LABELS[room.type]}</h3>
              <p className="max-w-md text-sand/80">{room.description}</p>
              <p className="text-gold">Desde {room.from} por noche</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
