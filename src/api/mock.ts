import { nightsBetween, nightsOf, rangesOverlap, todayIso } from '../lib/dates'
import { ApiError } from './errors'
import type { HotelApi } from './hotelApi'
import { getToken } from './session'
import type {
  AuthResponse,
  AvailableRoom,
  CreateReservationRequest,
  Invoice,
  InvoiceLine,
  Reservation,
  RoomType,
  ServiceType,
  User,
} from './types'

interface MockRoom {
  id: number
  number: string
  type: RoomType
}

interface StoredUser extends User {
  password: string
}

interface StoredReservation extends Reservation {
  ownerId: string
}

const BASE_PRICE: Record<RoomType, number> = { SINGLE: 60, DOUBLE: 90, SUITE: 180 }
const HIGH_SEASON_MULTIPLIER = 1.5
const SERVICE_NAMES: Record<ServiceType, string> = {
  SPA: 'Spa',
  BREAKFAST: 'Desayuno',
  TRANSFER: 'Traslado',
}

const ROOMS: MockRoom[] = [
  ...[101, 102, 103, 104, 105, 106].map((n, i) => ({ id: i + 1, number: String(n), type: 'SINGLE' as const })),
  ...[201, 202, 203, 204, 205, 206].map((n, i) => ({ id: i + 7, number: String(n), type: 'DOUBLE' as const })),
  ...[301, 302, 303].map((n, i) => ({ id: i + 13, number: String(n), type: 'SUITE' as const })),
]

/** High season: Jun 1 - Aug 31 and Dec 15 - Jan 6. */
export function isHighSeason(iso: string): boolean {
  const [, month, day] = iso.split('-').map(Number)
  const monthDay = month * 100 + day
  return (monthDay >= 601 && monthDay <= 831) || monthDay >= 1215 || monthDay <= 106
}

function priceFor(type: RoomType, checkIn: string, checkOut: string) {
  const nights = nightsOf(checkIn, checkOut)
  const highSeasonNights = nights.filter(isHighSeason).length
  const base = BASE_PRICE[type]
  const totalPrice = base * (nights.length - highSeasonNights) + base * HIGH_SEASON_MULTIPLIER * highSeasonNights
  return { nights: nights.length, highSeasonNights, totalPrice }
}

function serviceCost(type: ServiceType, nights: number): number {
  if (type === 'SPA') return 50
  if (type === 'BREAKFAST') return 15 * nights
  return 30
}

function buildInvoice(reservation: StoredReservation, counter: number): Invoice {
  const lines: InvoiceLine[] = [
    {
      description: `Habitación ${reservation.room.number} (${reservation.nights} noches)`,
      quantity: reservation.nights,
      unitPrice: reservation.roomTotal / reservation.nights,
      subtotal: reservation.roomTotal,
    },
    ...reservation.services.map((service) => ({
      description: service.name,
      quantity: 1,
      unitPrice: service.cost,
      subtotal: service.cost,
    })),
  ]
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0)
  return {
    number: `FAC-${String(counter).padStart(5, '0')}`,
    reservationId: reservation.id,
    guestName: reservation.guest.fullName,
    roomNumber: reservation.room.number,
    roomType: reservation.room.type,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    nights: reservation.nights,
    lines,
    subtotal,
    total: subtotal,
    issuedAt: new Date().toISOString(),
  }
}

export interface MockOptions {
  /** Artificial latency in milliseconds. */
  delayMs?: number
}

/** In-memory implementation of the API contract, for development and demos without the backend. */
export function createMockApi({ delayMs = 0 }: MockOptions = {}): HotelApi {
  const users = new Map<string, StoredUser>()
  const sessions = new Map<string, string>()
  const reservations = new Map<string, StoredReservation>()
  let userCounter = 0
  let invoiceCounter = 0

  const wait = () => (delayMs > 0 ? new Promise((resolve) => setTimeout(resolve, delayMs)) : Promise.resolve())

  function currentUser(): StoredUser {
    const userId = sessions.get(getToken() ?? '')
    const user = userId ? [...users.values()].find((u) => u.id === userId) : undefined
    if (!user) throw new ApiError(401, 'UNAUTHORIZED')
    return user
  }

  function ownReservation(id: string): StoredReservation {
    const user = currentUser()
    const reservation = reservations.get(id)
    if (!reservation) throw new ApiError(404, 'RESERVATION_NOT_FOUND')
    if (reservation.ownerId !== user.id) throw new ApiError(403, 'FORBIDDEN')
    return reservation
  }

  const publicView = ({ ownerId: _owner, ...reservation }: StoredReservation): Reservation => ({
    ...reservation,
    services: [...reservation.services],
  })

  function startSession(user: StoredUser): AuthResponse {
    const token = crypto.randomUUID()
    sessions.set(token, user.id)
    return { token, user: { id: user.id, fullName: user.fullName, email: user.email } }
  }

  function recalc(reservation: StoredReservation) {
    reservation.servicesTotal = reservation.services.reduce((sum, s) => sum + s.cost, 0)
    reservation.total = reservation.roomTotal + reservation.servicesTotal
  }

  return {
    async register(body) {
      await wait()
      const email = body.email.trim().toLowerCase()
      if (!body.fullName.trim() || !email || body.password.length < 8) throw new ApiError(400, 'VALIDATION_ERROR')
      if (users.has(email)) throw new ApiError(409, 'EMAIL_ALREADY_REGISTERED')
      const user: StoredUser = { id: `U-${++userCounter}`, fullName: body.fullName.trim(), email, password: body.password }
      users.set(email, user)
      return startSession(user)
    },

    async login(body) {
      await wait()
      const user = users.get(body.email.trim().toLowerCase())
      if (!user || user.password !== body.password) throw new ApiError(401, 'INVALID_CREDENTIALS')
      return startSession(user)
    },

    async me() {
      await wait()
      const { id, fullName, email } = currentUser()
      return { id, fullName, email }
    },

    async logout() {
      await wait()
      const token = getToken()
      if (token) sessions.delete(token)
    },

    async getAvailability({ checkIn, checkOut, type }) {
      await wait()
      if (!checkIn || !checkOut || nightsBetween(checkIn, checkOut) < 1) throw new ApiError(400, 'INVALID_DATES')
      const taken = new Set(
        [...reservations.values()]
          .filter((r) => r.status !== 'CHECKED_OUT' && rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut))
          .map((r) => r.room.id),
      )
      return ROOMS.filter((room) => !taken.has(room.id) && (!type || room.type === type)).map(
        (room): AvailableRoom => ({
          id: room.id,
          number: room.number,
          type: room.type,
          pricePerNight: BASE_PRICE[room.type],
          ...priceFor(room.type, checkIn, checkOut),
        }),
      )
    },

    async createReservation(body: CreateReservationRequest) {
      await wait()
      const user = currentUser()
      const room = ROOMS.find((r) => r.id === body.roomId)
      if (!room) throw new ApiError(404, 'ROOM_NOT_FOUND')
      if (nightsBetween(body.checkIn, body.checkOut) < 1 || body.checkIn < todayIso()) {
        throw new ApiError(400, 'INVALID_DATES')
      }
      const { fullName, email, phone, document } = body.guest
      if (![fullName, email, phone, document].every((v) => v?.trim())) throw new ApiError(400, 'VALIDATION_ERROR')
      const conflict = [...reservations.values()].some(
        (r) =>
          r.room.id === room.id &&
          r.status !== 'CHECKED_OUT' &&
          rangesOverlap(body.checkIn, body.checkOut, r.checkIn, r.checkOut),
      )
      if (conflict) throw new ApiError(409, 'ROOM_NOT_AVAILABLE')

      const pricing = priceFor(room.type, body.checkIn, body.checkOut)
      const reservation: StoredReservation = {
        id: `RES-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        ownerId: user.id,
        status: 'CONFIRMED',
        room: { id: room.id, number: room.number, type: room.type },
        guest: body.guest,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: pricing.nights,
        roomTotal: pricing.totalPrice,
        services: [],
        servicesTotal: 0,
        total: pricing.totalPrice,
        digitalKey: null,
        invoice: null,
      }
      reservations.set(reservation.id, reservation)
      return publicView(reservation)
    },

    async getReservation(id) {
      await wait()
      return publicView(ownReservation(id))
    },

    async addService(id, serviceType) {
      await wait()
      const reservation = ownReservation(id)
      if (!(serviceType in SERVICE_NAMES)) throw new ApiError(400, 'INVALID_SERVICE')
      if (reservation.status === 'CHECKED_OUT') throw new ApiError(409, 'INVALID_STATE')
      reservation.services.push({
        type: serviceType,
        name: SERVICE_NAMES[serviceType],
        cost: serviceCost(serviceType, reservation.nights),
      })
      recalc(reservation)
      return publicView(reservation)
    },

    async checkIn(id) {
      await wait()
      const reservation = ownReservation(id)
      if (reservation.status !== 'CONFIRMED') throw new ApiError(409, 'INVALID_STATE')
      reservation.status = 'CHECKED_IN'
      reservation.digitalKey = crypto.randomUUID()
      return publicView(reservation)
    },

    async checkOut(id) {
      await wait()
      const reservation = ownReservation(id)
      if (reservation.status !== 'CHECKED_IN') throw new ApiError(409, 'INVALID_STATE')
      reservation.status = 'CHECKED_OUT'
      reservation.invoice = buildInvoice(reservation, ++invoiceCounter)
      return publicView(reservation)
    },

    async myReservations() {
      await wait()
      const user = currentUser()
      return [...reservations.values()]
        .filter((r) => r.ownerId === user.id)
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
        .map(publicView)
    },
  }
}
