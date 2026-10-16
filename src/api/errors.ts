import type { ApiErrorBody } from './types'

const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los datos ingresados e inténtalo de nuevo.',
  INVALID_DATES: 'Las fechas no son válidas. La salida debe ser posterior a la entrada.',
  ROOM_NOT_AVAILABLE: 'La habitación ya no está disponible para esas fechas.',
  ROOM_NOT_FOUND: 'No encontramos la habitación solicitada.',
  RESERVATION_NOT_FOUND: 'No encontramos una reserva con ese código.',
  INVALID_STATE: 'Esta acción no está permitida en el estado actual de la reserva.',
  INVALID_SERVICE: 'El servicio seleccionado no es válido.',
  INTERNAL_ERROR: 'Ocurrió un error en el servidor. Inténtalo de nuevo en unos minutos.',
}

export const NETWORK_ERROR_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
export const UNKNOWN_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo.'

export function toSpanishMessage(code: string): string {
  return MESSAGES[code] ?? UNKNOWN_ERROR_MESSAGE
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorBody['details']

  constructor(status: number, code: string, details?: ApiErrorBody['details']) {
    super(toSpanishMessage(code))
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
}
