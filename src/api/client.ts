import { ApiError, NETWORK_ERROR_MESSAGE } from './errors'
import type {
  ApiErrorBody,
  AvailableRoom,
  CreateReservationRequest,
  Reservation,
  RoomType,
  ServiceType,
} from './types'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const HOTEL = '/api/hotel'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${HOTEL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Partial<ApiErrorBody> | null
    throw new ApiError(response.status, body?.code ?? 'INTERNAL_ERROR', body?.details)
  }
  return (await response.json()) as T
}

export interface AvailabilityQuery {
  checkIn: string
  checkOut: string
  type?: RoomType
}

export function getAvailability({ checkIn, checkOut, type }: AvailabilityQuery) {
  const params = new URLSearchParams({ checkIn, checkOut })
  if (type) params.set('type', type)
  return request<AvailableRoom[]>(`/disponibilidad?${params.toString()}`)
}

export function createReservation(body: CreateReservationRequest) {
  return request<Reservation>('/reservar', { method: 'POST', body: JSON.stringify(body) })
}

export function getReservation(id: string) {
  return request<Reservation>(`/reserva/${encodeURIComponent(id)}`)
}

export function addService(id: string, serviceType: ServiceType) {
  return request<Reservation>(`/servicios/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify({ serviceType }),
  })
}

export function checkIn(id: string) {
  return request<Reservation>(`/checkin/${encodeURIComponent(id)}`, { method: 'PUT' })
}

export function checkOut(id: string) {
  return request<Reservation>(`/checkout/${encodeURIComponent(id)}`, { method: 'PUT' })
}
