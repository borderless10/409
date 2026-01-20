export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  created_at: string
}

/* =========================
   STATION
========================= */
export interface Station {
  id: string
  name: string

  // 📍 Localização
  address: string
  city: string
  state: string
  latitude: number
  longitude: number

  // ⚡ Infraestrutura
  total_chargers: number
  available_chargers: number
  power_output: string
  connector_types: string[]
  amenities: string[]

  // 💰 Operação
  price_per_kwh: number
  status: "active" | "maintenance" | "inactive"

  // 🔐 Gestão
  owner_id: string
  created_at: string
  updated_at: string
}

/* =========================
   CHARGER
========================= */
export interface Charger {
  id: string
  station_id: string
  charger_number: string
  status: "available" | "occupied" | "maintenance" | "reserved"
  connector_type: string
  power_output: string
  current_session_id?: string
}

/* =========================
   BOOKING
========================= */
export interface Booking {
  id: string
  user_id: string
  station_id: string
  charger_id: string
  start_time: string
  end_time: string
  status: "pending" | "active" | "completed" | "cancelled"

  total_kwh?: number
  total_cost?: number

  payment_status: "pending" | "paid" | "failed"
  created_at: string
}

/* =========================
   CHARGING SESSION
========================= */
export interface ChargingSession {
  id: string
  booking_id: string
  user_id: string
  station_id: string
  charger_id: string
  start_time: string
  end_time?: string
  kwh_consumed: number
  cost: number
  status: "active" | "completed"
}

/* =========================
   PAYMENT
========================= */
export interface Payment {
  id: string
  booking_id: string
  user_id: string
  amount: number
  status: "pending" | "completed" | "failed"
  payment_method: string
  created_at: string
}
