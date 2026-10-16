import type { Reservation, ReservationStatus } from '../../api/types'
import { ROOM_TYPE_LABELS, STATUS_LABELS, formatDate, formatMoney } from '../../lib/format'

const STATUS_STYLES: Record<ReservationStatus, string> = {
  CONFIRMED: 'bg-sand/15 text-sand',
  CHECKED_IN: 'bg-gold/20 text-gold',
  CHECKED_OUT: 'bg-white/10 text-sand/70',
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export default function ReservationSummary({ reservation }: { reservation: Reservation }) {
  return (
    <section aria-label="Resumen de la reserva" className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-sand/60">Código de reserva</p>
          <p className="text-2xl font-medium tracking-wide">{reservation.id}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-sand/60">Habitación</dt>
          <dd>
            {ROOM_TYPE_LABELS[reservation.room.type]} · {reservation.room.number}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Huésped</dt>
          <dd>{reservation.guest.fullName}</dd>
          <dd className="text-sm text-sand/60">{reservation.guest.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Entrada</dt>
          <dd>{formatDate(reservation.checkIn)}</dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Salida</dt>
          <dd>{formatDate(reservation.checkOut)}</dd>
        </div>
      </dl>

      <table className="mt-8 w-full text-sm">
        <caption className="sr-only">Desglose de cargos</caption>
        <thead className="text-left text-sand/60">
          <tr>
            <th className="pb-3 font-normal">Concepto</th>
            <th className="pb-3 text-right font-normal">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          <tr>
            <td className="py-3">
              Alojamiento ({reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'})
            </td>
            <td className="py-3 text-right">{formatMoney(reservation.roomTotal)}</td>
          </tr>
          {reservation.services.map((service, index) => (
            <tr key={`${service.type}-${index}`}>
              <td className="py-3">{service.name}</td>
              <td className="py-3 text-right">{formatMoney(service.cost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/20 text-lg">
            <th scope="row" className="pt-4 text-left font-medium">
              Total
            </th>
            <td className="pt-4 text-right font-medium text-gold">{formatMoney(reservation.total)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
