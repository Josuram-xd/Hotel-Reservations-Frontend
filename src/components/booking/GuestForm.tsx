import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Guest } from '../../api/types'
import { hasErrors, validateEmail, validatePhone, validateRequired } from '../../lib/validation'
import type { FieldErrors } from '../../lib/validation'
import Button from '../ui/Button'
import Input from '../ui/Input'

type Field = keyof Guest

export function validateGuest(guest: Guest): FieldErrors<Field> {
  return {
    fullName: validateRequired(guest.fullName, 'El nombre'),
    email: validateEmail(guest.email),
    phone: validatePhone(guest.phone),
    document: validateRequired(guest.document, 'El documento de identidad'),
  }
}

interface GuestFormProps {
  initial?: Partial<Guest>
  submitting?: boolean
  serverError?: string | null
  onSubmit(guest: Guest): void
}

export default function GuestForm({ initial, submitting = false, serverError = null, onSubmit }: GuestFormProps) {
  const [guest, setGuest] = useState<Guest>({
    fullName: initial?.fullName ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    document: initial?.document ?? '',
  })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})

  const update = (field: Field) => (event: { target: { value: string } }) =>
    setGuest({ ...guest, [field]: event.target.value })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateGuest(guest)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return
    onSubmit({
      fullName: guest.fullName.trim(),
      email: guest.email.trim(),
      phone: guest.phone.trim(),
      document: guest.document.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label="Nombre completo"
        autoComplete="name"
        value={guest.fullName}
        onChange={update('fullName')}
        error={errors.fullName}
      />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        value={guest.email}
        onChange={update('email')}
        error={errors.email}
      />
      <Input
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        value={guest.phone}
        onChange={update('phone')}
        error={errors.phone}
      />
      <Input
        label="Documento de identidad"
        value={guest.document}
        onChange={update('document')}
        error={errors.document}
      />
      {serverError && (
        <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {serverError}
        </p>
      )}
      <Button type="submit" loading={submitting}>
        Confirmar reserva
      </Button>
    </form>
  )
}
