import { ApiError, NETWORK_ERROR_MESSAGE } from './errors'
import type { AvailabilityQuery, HotelApi } from './hotelApi'
import { getToken } from './session'
import type {
  ApiErrorBody,
  AuthResponse,
  AvailableRoom,
  CreateReservationRequest,
  LoginRequest,
  RegisterRequest,
  Reservation,
  ServiceType,
  User,
} from './types'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE)
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Partial<ApiErrorBody> | null
    throw new ApiError(response.status, body?.code ?? 'INTERNAL_ERROR', body?.details)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

const id = encodeURIComponent

export type { AvailabilityQuery }

export function register(body: RegisterRequest) {
  return request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })
}

export function login(body: LoginRequest) {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
}

export function me() {
  return request<User>('/api/auth/me')
}

export function logout() {
  return request<void>('/api/auth/logout', { method: 'POST' })
}

export function getAvailability({ checkIn, checkOut, type }: AvailabilityQuery) {
  const params = new URLSearchParams({ checkIn, checkOut })
  if (type) params.set('type', type)
  return request<AvailableRoom[]>(`/api/hotel/disponibilidad?${params.toString()}`)
}

export function createReservation(body: CreateReservationRequest) {
  return request<Reservation>('/api/hotel/reservar', { method: 'POST', body: JSON.stringify(body) })
}

export function getReservation(reservationId: string) {
  return request<Reservation>(`/api/hotel/reserva/${id(reservationId)}`)
}

export function addService(reservationId: string, serviceType: ServiceType) {
  return request<Reservation>(`/api/hotel/servicios/${id(reservationId)}`, {
    method: 'POST',
    body: JSON.stringify({ serviceType }),
  })
}

export function checkIn(reservationId: string) {
  return request<Reservation>(`/api/hotel/checkin/${id(reservationId)}`, { method: 'PUT' })
}

export function checkOut(reservationId: string) {
  return request<Reservation>(`/api/hotel/checkout/${id(reservationId)}`, { method: 'PUT' })
}

export function myReservations() {
  return request<Reservation[]>('/api/hotel/mis-reservas')
}

export const httpApi: HotelApi = {
  register,
  login,
  me,
  logout,
  getAvailability,
  createReservation,
  getReservation,
  addService,
  checkIn,
  checkOut,
  myReservations,
}
