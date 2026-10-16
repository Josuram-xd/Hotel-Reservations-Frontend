# API contract (frontend <-> backend)

Proposal agreed between frontend and backend. Base URL: `VITE_API_URL`. All JSON. Dates are ISO `YYYY-MM-DD`.
Date ranges are `[checkIn, checkOut)`. If the backend changes a field, update this file and `src/api/types.ts` in the same PR.

Enums: `RoomType = SINGLE | DOUBLE | SUITE`, `ServiceType = SPA | BREAKFAST | TRANSFER`,
`ReservationStatus = CONFIRMED | CHECKED_IN | CHECKED_OUT`.

## GET /api/hotel/disponibilidad?checkIn=&checkOut=&type=

`type` is optional. Returns `AvailableRoom[]` with the dynamic price already computed by the server:
`{ id, number, type, pricePerNight, nights, highSeasonNights, totalPrice }`.

## POST /api/hotel/reservar

Body: `{ roomId, checkIn, checkOut, guest: { fullName, email, phone, document } }`. Returns `Reservation` (201).

## GET /api/hotel/reserva/{reservaId}

Returns `Reservation`:
`{ id, status, room: { id, number, type }, guest, checkIn, checkOut, nights, roomTotal, services: [{ type, name, cost }], servicesTotal, total, digitalKey: string | null, invoice: Invoice | null }`.

## POST /api/hotel/servicios/{reservaId}

Body: `{ serviceType }`. Returns the updated `Reservation`. Allowed while `CONFIRMED` or `CHECKED_IN`.

## PUT /api/hotel/checkin/{reservaId}

Returns `Reservation` with `status = CHECKED_IN` and `digitalKey` (UUID) set.

## PUT /api/hotel/checkout/{reservaId}

Returns `Reservation` with `status = CHECKED_OUT` and `invoice` set.

## Invoice

`{ number, reservationId, guestName, roomNumber, roomType, checkIn, checkOut, nights, lines: [{ description, quantity, unitPrice, subtotal }], subtotal, total, issuedAt }`.

## Errors

Non-2xx responses: `{ status, code, message, details?: { field: string, message: string }[] }`.
Codes: `VALIDATION_ERROR`, `INVALID_DATES`, `ROOM_NOT_AVAILABLE`, `ROOM_NOT_FOUND`, `RESERVATION_NOT_FOUND`, `INVALID_STATE`, `INVALID_SERVICE`, `INTERNAL_ERROR`.
The frontend maps `code` to Spanish messages; the server `message` is not shown to users.

## CORS

Backend must allow the frontend origin (`CORS_ALLOWED_ORIGINS`) for GET, POST, PUT and the `Content-Type` header.
