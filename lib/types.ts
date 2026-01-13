export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  created_at: string
}

export interface Station {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  total_chargers: number
  available_chargers: number
  price_per_kwh: number
  power_output: string
  connector_types: string[]
  amenities: string[]
  status: "active" | "maintenance" | "inactive"
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Charger {
  id: string
  station_id: string
  charger_number: string
  status: "available" | "occupied" | "maintenance" | "reserved"
  connector_type: string
  power_output: string
  current_session_id?: string
}

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

export interface Payment {
  id: string
  booking_id: string
  user_id: string
  amount: number
  status: "pending" | "completed" | "failed"
  payment_method: string
  created_at: string
}
