import { beforeEach } from 'vitest'
import { addDays, todayIso } from '../lib/dates'
import { ApiError } from './errors'
import type { HotelApi } from './hotelApi'
import { createMockApi, isHighSeason } from './mock'
import { clearToken, setToken } from './session'

const guest = { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' }
const checkIn = addDays(todayIso(), 10)
const checkOut = addDays(todayIso(), 13)

let api: HotelApi

async function signIn(email = 'ana@example.com') {
  const { token } = await api.register({ fullName: 'Ana Perez', email, password: 'password1' })
  setToken(token)
}

async function codeOf(promise: Promise<unknown>): Promise<string | undefined> {
  return promise.then(
    () => undefined,
    (error: unknown) => (error instanceof ApiError ? error.code : 'OTHER'),
  )
}

beforeEach(() => {
  clearToken()
  api = createMockApi()
})

describe('mock seasons', () => {
  it('detects high season boundaries', () => {
    expect(isHighSeason('2026-07-15')).toBe(true)
    expect(isHighSeason('2026-12-20')).toBe(true)
    expect(isHighSeason('2027-01-06')).toBe(true)
    expect(isHighSeason('2026-05-31')).toBe(false)
    expect(isHighSeason('2026-09-01')).toBe(false)
    expect(isHighSeason('2027-01-07')).toBe(false)
  })
})

describe('mock auth', () => {
  it('registers, rejects duplicates and weak passwords, and logs in', async () => {
    await api.register({ fullName: 'Ana', email: 'ana@example.com', password: 'password1' })
    expect(await codeOf(api.register({ fullName: 'Ana', email: 'ANA@example.com', password: 'password1' }))).toBe(
      'EMAIL_ALREADY_REGISTERED',
    )
    expect(await codeOf(api.register({ fullName: 'Bo', email: 'bo@example.com', password: 'short' }))).toBe(
      'VALIDATION_ERROR',
    )
    expect(await codeOf(api.login({ email: 'ana@example.com', password: 'wrong-pass' }))).toBe('INVALID_CREDENTIALS')
    const session = await api.login({ email: 'ana@example.com', password: 'password1' })
    setToken(session.token)
    expect((await api.me()).email).toBe('ana@example.com')
  })

  it('requires a session for protected calls', async () => {
    expect(await codeOf(api.myReservations())).toBe('UNAUTHORIZED')
    expect(await codeOf(api.createReservation({ roomId: 1, checkIn, checkOut, guest }))).toBe('UNAUTHORIZED')
  })

  it('invalidates the token on logout', async () => {
    await signIn()
    await api.logout()
    expect(await codeOf(api.me())).toBe('UNAUTHORIZED')
  })
})

describe('mock availability and pricing', () => {
  it('has at least 15 rooms across the three types', async () => {
    const rooms = await api.getAvailability({ checkIn, checkOut })
    expect(rooms.length).toBeGreaterThanOrEqual(15)
    expect(new Set(rooms.map((r) => r.type))).toEqual(new Set(['SINGLE', 'DOUBLE', 'SUITE']))
  })

  it('filters by type and rejects invalid dates', async () => {
    const suites = await api.getAvailability({ checkIn, checkOut, type: 'SUITE' })
    expect(suites.every((r) => r.type === 'SUITE')).toBe(true)
    expect(await codeOf(api.getAvailability({ checkIn: checkOut, checkOut: checkIn }))).toBe('INVALID_DATES')
  })

  it('applies the 1.5 multiplier to high season nights only', async () => {
    const rooms = await api.getAvailability({ checkIn: '2026-07-01', checkOut: '2026-07-03', type: 'SINGLE' })
    expect(rooms[0].totalPrice).toBe(60 * 1.5 * 2)
    expect(rooms[0].highSeasonNights).toBe(2)
    const low = await api.getAvailability({ checkIn: '2026-10-01', checkOut: '2026-10-03', type: 'SINGLE' })
    expect(low[0].totalPrice).toBe(120)
  })
})

describe('mock reservation lifecycle', () => {
  it('creates, hides the booked room, adds services, checks in and out with an invoice', async () => {
    await signIn()
    const reservation = await api.createReservation({ roomId: 13, checkIn, checkOut, guest })
    expect(reservation.status).toBe('CONFIRMED')

    const remaining = await api.getAvailability({ checkIn, checkOut, type: 'SUITE' })
    expect(remaining.some((r) => r.id === 13)).toBe(false)

    await api.addService(reservation.id, 'SPA')
    const withServices = await api.addService(reservation.id, 'BREAKFAST')
    expect(withServices.servicesTotal).toBe(50 + 15 * 3)

    const checkedIn = await api.checkIn(reservation.id)
    expect(checkedIn.digitalKey).toMatch(/^[0-9a-f-]{36}$/)

    const done = await api.checkOut(reservation.id)
    expect(done.status).toBe('CHECKED_OUT')
    expect(done.invoice?.total).toBe(done.total)
    expect(done.invoice?.lines).toHaveLength(3)
  })

  it('blocks double booking and invalid transitions', async () => {
    await signIn()
    const reservation = await api.createReservation({ roomId: 1, checkIn, checkOut, guest })
    expect(await codeOf(api.createReservation({ roomId: 1, checkIn, checkOut, guest }))).toBe('ROOM_NOT_AVAILABLE')
    expect(await codeOf(api.checkOut(reservation.id))).toBe('INVALID_STATE')
    await api.checkIn(reservation.id)
    expect(await codeOf(api.checkIn(reservation.id))).toBe('INVALID_STATE')
  })

  it('frees the room again after check-out', async () => {
    await signIn()
    const reservation = await api.createReservation({ roomId: 2, checkIn, checkOut, guest })
    await api.checkIn(reservation.id)
    await api.checkOut(reservation.id)
    const rooms = await api.getAvailability({ checkIn, checkOut, type: 'SINGLE' })
    expect(rooms.some((r) => r.id === 2)).toBe(true)
  })

  it('does not let another user touch the reservation', async () => {
    await signIn()
    const reservation = await api.createReservation({ roomId: 3, checkIn, checkOut, guest })
    await signIn('other@example.com')
    expect(await codeOf(api.getReservation(reservation.id))).toBe('FORBIDDEN')
    expect(await api.myReservations()).toHaveLength(0)
  })

  it('rejects past dates and unknown reservations', async () => {
    await signIn()
    expect(
      await codeOf(api.createReservation({ roomId: 4, checkIn: '2020-01-01', checkOut: '2020-01-03', guest })),
    ).toBe('INVALID_DATES')
    expect(await codeOf(api.getReservation('RES-NOPE'))).toBe('RESERVATION_NOT_FOUND')
  })
})
