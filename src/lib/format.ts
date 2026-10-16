const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return currency.format(value)
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(year, month - 1, day))
}

export const ROOM_TYPE_LABELS = {
  SINGLE: 'Sencilla',
  DOUBLE: 'Doble',
  SUITE: 'Suite',
} as const

export const SERVICE_LABELS = {
  SPA: 'Spa',
  BREAKFAST: 'Desayuno',
  TRANSFER: 'Traslado',
} as const

export const STATUS_LABELS = {
  CONFIRMED: 'Confirmada',
  CHECKED_IN: 'Check-in realizado',
  CHECKED_OUT: 'Check-out realizado',
} as const
