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

## Authentication (users)

Users are stored in memory in the backend. Sessions use an opaque bearer token: `Authorization: Bearer <token>`.
`GET /api/hotel/disponibilidad` is public. Every other `/api/hotel/*` endpoint requires a valid token.
A reservation belongs to the user who created it; acting on someone else reservation returns `FORBIDDEN`.

`User = { id, fullName, email }` and `AuthResponse = { token, user: User }`.

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, email, password }` | `AuthResponse` (201) |
| POST | `/api/auth/login` | `{ email, password }` | `AuthResponse` |
| GET | `/api/auth/me` | none | `User` |
| POST | `/api/auth/logout` | none | 204 |
| GET | `/api/hotel/mis-reservas` | none | `Reservation[]` of the authenticated user |

Extra error codes: `UNAUTHORIZED` (401, missing or expired token), `FORBIDDEN` (403), `INVALID_CREDENTIALS` (401), `EMAIL_ALREADY_REGISTERED` (409).
Password rule: at least 8 characters.

## Mock mode (frontend only)

With `VITE_USE_MOCK=true` the frontend uses an in-memory implementation of this contract (`src/api/mock.ts`), so the UI can be developed and demoed without the backend.
