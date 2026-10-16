import { useState } from 'react'
import type { FormEvent } from 'react'
import type { RoomType } from '../../api/types'
import { nightsBetween, todayIso } from '../../lib/dates'
import { ROOM_TYPE_LABELS } from '../../lib/format'
import Button from '../ui/Button'
import Input from '../ui/Input'

export interface SearchValues {
  checkIn: string
  checkOut: string
  type: RoomType | ''
}

export function validateSearch({ checkIn, checkOut }: SearchValues): Partial<Record<'checkIn' | 'checkOut', string>> {
  const errors: Partial<Record<'checkIn' | 'checkOut', string>> = {}
  if (!checkIn) errors.checkIn = 'Elige la fecha de entrada.'
  else if (checkIn < todayIso()) errors.checkIn = 'La fecha de entrada no puede ser anterior a hoy.'
  if (!checkOut) errors.checkOut = 'Elige la fecha de salida.'
  else if (checkIn && nightsBetween(checkIn, checkOut) < 1) {
    errors.checkOut = 'La salida debe ser posterior a la entrada.'
  }
  return errors
}

interface SearchFormProps {
  initial: SearchValues
  onSearch(values: SearchValues): void
}

export default function SearchForm({ initial, onSearch }: SearchFormProps) {
  const [values, setValues] = useState<SearchValues>(initial)
  const [errors, setErrors] = useState<ReturnType<typeof validateSearch>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateSearch(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSearch(values)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start"
    >
      <Input
        label="Entrada"
        type="date"
        min={todayIso()}
        value={values.checkIn}
        onChange={(e) => setValues({ ...values, checkIn: e.target.value })}
        error={errors.checkIn}
      />
      <Input
        label="Salida"
        type="date"
        min={values.checkIn || todayIso()}
        value={values.checkOut}
        onChange={(e) => setValues({ ...values, checkOut: e.target.value })}
        error={errors.checkOut}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="room-type" className="text-sm text-sand/80">
          Tipo de habitación
        </label>
        <select
          id="room-type"
          value={values.type}
          onChange={(e) => setValues({ ...values, type: e.target.value as RoomType | '' })}
          className="rounded-2xl border border-white/15 bg-ink px-4 py-3 text-sand focus-visible:outline-2 focus-visible:outline-gold"
        >
          <option value="">Todas</option>
          {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((type) => (
            <option key={type} value={type}>
              {ROOM_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="md:mt-7">
        Buscar disponibilidad
      </Button>
    </form>
  )
}
