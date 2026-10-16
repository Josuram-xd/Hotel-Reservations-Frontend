import { useSearchParams } from 'react-router-dom'
import SearchForm, { validateSearch } from '../components/search/SearchForm'
import type { SearchValues } from '../components/search/SearchForm'
import type { RoomType } from '../api/types'

const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'SUITE']

export function readSearchParams(params: URLSearchParams): SearchValues {
  const type = params.get('type') as RoomType | null
  return {
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    type: type && ROOM_TYPES.includes(type) ? type : '',
  }
}

export default function Search() {
  const [params, setParams] = useSearchParams()
  const values = readSearchParams(params)
  const hasQuery = Boolean(values.checkIn && values.checkOut)
  const isValid = hasQuery && Object.keys(validateSearch(values)).length === 0

  function handleSearch(next: SearchValues) {
    const query: Record<string, string> = { checkIn: next.checkIn, checkOut: next.checkOut }
    if (next.type) query.type = next.type
    setParams(query)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-32 pt-40">
      <h1 className="mb-10 font-light" style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}>
        Busca tu habitación
      </h1>
      <SearchForm key={params.toString()} initial={values} onSearch={handleSearch} />
      {hasQuery && !isValid && (
        <p role="alert" className="mt-6 text-red-300">
          Las fechas de la búsqueda no son válidas. Corrígelas e inténtalo de nuevo.
        </p>
      )}
    </section>
  )
}
