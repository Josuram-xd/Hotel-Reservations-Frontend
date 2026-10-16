const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export function validateRequired(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} es obligatorio.`
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'El correo es obligatorio.'
  return EMAIL_PATTERN.test(value.trim()) ? undefined : 'Ingresa un correo válido, por ejemplo nombre@correo.com.'
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'La contraseña es obligatoria.'
  return value.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
}

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return 'El teléfono es obligatorio.'
  return /^[+\d][\d\s-]{6,}$/.test(value.trim()) ? undefined : 'Ingresa un teléfono válido, solo números.'
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean)
}
