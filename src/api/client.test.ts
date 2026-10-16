import { afterEach, beforeEach, vi } from 'vitest'
import { addService, checkIn, checkOut, createReservation, getAvailability, getReservation } from './client'
import { ApiError, NETWORK_ERROR_MESSAGE, getErrorMessage, toSpanishMessage } from './errors'

const fetchMock = vi.fn()

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('api client requests', () => {
  it('builds the availability query string and omits an empty type', async () => {
    fetchMock.mockReturnValue(jsonResponse([]))
    await getAvailability({ checkIn: '2026-12-20', checkOut: '2026-12-23' })
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/api/hotel/disponibilidad?checkIn=2026-12-20&checkOut=2026-12-23')
    expect(url).not.toContain('type=')
  })

  it('includes the room type filter when provided', async () => {
    fetchMock.mockReturnValue(jsonResponse([]))
    await getAvailability({ checkIn: '2026-12-20', checkOut: '2026-12-23', type: 'SUITE' })
    expect(fetchMock.mock.calls[0][0]).toContain('type=SUITE')
  })

  it('posts the reservation body as JSON', async () => {
    fetchMock.mockReturnValue(jsonResponse({ id: 'r1' }, 201))
    const body = {
      roomId: 3,
      checkIn: '2026-12-20',
      checkOut: '2026-12-23',
      guest: { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3001234567', document: '123' },
    }
    const result = await createReservation(body)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/hotel/reservar')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual(body)
    expect(result).toEqual({ id: 'r1' })
  })

  it('uses the right method and path for each reservation action', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ id: 'r1' }))
    await getReservation('r1')
    await addService('r1', 'SPA')
    await checkIn('r1')
    await checkOut('r1')
    const calls = fetchMock.mock.calls.map(([url, init]) => [init?.method ?? 'GET', url as string])
    expect(calls[0]).toEqual(['GET', expect.stringContaining('/api/hotel/reserva/r1')])
    expect(calls[1]).toEqual(['POST', expect.stringContaining('/api/hotel/servicios/r1')])
    expect(calls[2]).toEqual(['PUT', expect.stringContaining('/api/hotel/checkin/r1')])
    expect(calls[3]).toEqual(['PUT', expect.stringContaining('/api/hotel/checkout/r1')])
  })

  it('encodes the reservation id in the path', async () => {
    fetchMock.mockReturnValue(jsonResponse({}))
    await getReservation('a/b')
    expect(fetchMock.mock.calls[0][0]).toContain('/reserva/a%2Fb')
  })
})

describe('api client errors', () => {
  it('throws an ApiError with a Spanish message for a known code', async () => {
    fetchMock.mockReturnValue(
      jsonResponse({ status: 409, code: 'ROOM_NOT_AVAILABLE', message: 'Room taken' }, 409),
    )
    const error = await getReservation('r1').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(409)
    expect((error as ApiError).message).toBe(toSpanishMessage('ROOM_NOT_AVAILABLE'))
  })

  it('falls back to INTERNAL_ERROR when the error body is not JSON', async () => {
    fetchMock.mockReturnValue(Promise.resolve(new Response('boom', { status: 500 })))
    const error = (await getReservation('r1').catch((e: unknown) => e)) as ApiError
    expect(error.code).toBe('INTERNAL_ERROR')
  })

  it('uses a generic Spanish message for unknown codes', () => {
    expect(toSpanishMessage('SOMETHING_NEW')).toBe('Ocurrió un error inesperado. Inténtalo de nuevo.')
  })

  it('reports a Spanish network error when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await getReservation('r1').catch((e: unknown) => e)
    expect(getErrorMessage(error)).toBe(NETWORK_ERROR_MESSAGE)
  })
})
