import type { Invoice } from '../../api/types'
import { ROOM_TYPE_LABELS, formatDate, formatMoney } from '../../lib/format'

interface InvoiceViewProps {
  invoice: Invoice
}

/** Itemized invoice exactly as returned by the server. */
export default function InvoiceView({ invoice }: InvoiceViewProps) {
  return (
    <article aria-label="Factura" className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-sm text-sand/60">Factura</p>
          <p className="text-2xl font-medium tracking-wide">{invoice.number}</p>
        </div>
        <p className="text-sm text-sand/60">Emitida el {formatDate(invoice.issuedAt.slice(0, 10))}</p>
      </header>

      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-sand/60">Huésped</dt>
          <dd>{invoice.guestName}</dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Habitación</dt>
          <dd>
            {ROOM_TYPE_LABELS[invoice.roomType]} · {invoice.roomNumber}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Entrada</dt>
          <dd>{formatDate(invoice.checkIn)}</dd>
        </div>
        <div>
          <dt className="text-sm text-sand/60">Salida</dt>
          <dd>{formatDate(invoice.checkOut)}</dd>
        </div>
      </dl>

      <table className="mt-8 w-full text-sm">
        <caption className="sr-only">Detalle de la factura</caption>
        <thead className="text-left text-sand/60">
          <tr>
            <th className="pb-3 font-normal">Concepto</th>
            <th className="pb-3 text-right font-normal">Cantidad</th>
            <th className="pb-3 text-right font-normal">Precio unitario</th>
            <th className="pb-3 text-right font-normal">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {invoice.lines.map((line, index) => (
            <tr key={`${line.description}-${index}`}>
              <td className="py-3">{line.description}</td>
              <td className="py-3 text-right">{line.quantity}</td>
              <td className="py-3 text-right">{formatMoney(line.unitPrice)}</td>
              <td className="py-3 text-right">{formatMoney(line.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/20">
            <th scope="row" colSpan={3} className="pt-4 text-left font-medium">
              Subtotal
            </th>
            <td className="pt-4 text-right">{formatMoney(invoice.subtotal)}</td>
          </tr>
          <tr className="text-lg">
            <th scope="row" colSpan={3} className="pt-2 text-left font-medium">
              Total
            </th>
            <td className="pt-2 text-right font-medium text-gold">{formatMoney(invoice.total)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-8 text-sm text-sand/60">
        {invoice.nights} {invoice.nights === 1 ? 'noche' : 'noches'} de estadía · Gracias por quedarte en Hotel Aurora.
      </p>
    </article>
  )
}
