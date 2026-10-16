import { useParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import InvoiceView from '../components/invoice/InvoiceView'
import Button, { ButtonLink } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'

export default function InvoicePage() {
  const api = useApi()
  const { id = '' } = useParams()
  const loaded = useAsync(() => api.getReservation(id), [api, id])

  let content
  if (loaded.loading) {
    content = (
      <p role="status" className="text-sand/70">
        Cargando tu factura...
      </p>
    )
  } else if (loaded.error) {
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
  } else if (loaded.data && !loaded.data.invoice) {
    content = (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sand/70">
          La factura se genera al hacer check-out. Aún no está disponible para esta reserva.
        </p>
        <ButtonLink to={`/reserva/${encodeURIComponent(id)}`} variant="secondary">
          Ir a tu reserva
        </ButtonLink>
      </div>
    )
  } else if (loaded.data?.invoice) {
    content = <InvoiceView invoice={loaded.data.invoice} />
  }

  return (
    <section className="mx-auto max-w-3xl px-6 pb-32 pt-40">
      <h1 className="mb-10 font-light" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
        Tu factura
      </h1>
      {content}
    </section>
  )
}
