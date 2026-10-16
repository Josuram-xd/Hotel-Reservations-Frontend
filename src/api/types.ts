export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE'
export type ServiceType = 'SPA' | 'BREAKFAST' | 'TRANSFER'
export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'

export interface AvailableRoom {
  id: number
  number: string
  type: RoomType
  pricePerNight: number
  nights: number
  highSeasonNights: number
  totalPrice: number
}

export interface Guest {
  fullName: string
  email: string
  phone: string
  document: string
}

export interface CreateReservationRequest {
  roomId: number
  checkIn: string
  checkOut: string
  guest: Guest
}

export interface ReservationService {
  type: ServiceType
  name: string
  cost: number
}

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Invoice {
  number: string
  reservationId: string
  guestName: string
  roomNumber: string
  roomType: RoomType
  checkIn: string
  checkOut: string
  nights: number
  lines: InvoiceLine[]
  subtotal: number
  total: number
  issuedAt: string
}

export interface Reservation {
  id: string
  status: ReservationStatus
  room: { id: number; number: string; type: RoomType }
  guest: Guest
  checkIn: string
  checkOut: string
  nights: number
  roomTotal: number
  services: ReservationService[]
  servicesTotal: number
  total: number
  digitalKey: string | null
  invoice: Invoice | null
}

export interface ApiErrorBody {
  status: number
  code: string
  message: string
  details?: { field: string; message: string }[]
}
