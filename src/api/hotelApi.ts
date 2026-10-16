import type {
  AuthResponse,
  AvailableRoom,
  CreateReservationRequest,
  LoginRequest,
  RegisterRequest,
  Reservation,
  RoomType,
  ServiceType,
  User,
} from './types'

export interface AvailabilityQuery {
  checkIn: string
  checkOut: string
  type?: RoomType
}

/** Contract implemented by both the real HTTP client and the in-memory mock. */
export interface HotelApi {
  register(body: RegisterRequest): Promise<AuthResponse>
  login(body: LoginRequest): Promise<AuthResponse>
  me(): Promise<User>
  logout(): Promise<void>
  getAvailability(query: AvailabilityQuery): Promise<AvailableRoom[]>
  createReservation(body: CreateReservationRequest): Promise<Reservation>
  getReservation(id: string): Promise<Reservation>
  addService(id: string, serviceType: ServiceType): Promise<Reservation>
  checkIn(id: string): Promise<Reservation>
  checkOut(id: string): Promise<Reservation>
  myReservations(): Promise<Reservation[]>
}
