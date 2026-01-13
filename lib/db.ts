"use client"

import type { Station, Charger, Booking } from "./types"
import { mockStations, mockChargers, mockBookings } from "./mock-data"

// Mock database using localStorage
const DB_KEYS = {
  STATIONS: "evcharge_stations",
  CHARGERS: "evcharge_chargers",
  BOOKINGS: "evcharge_bookings",
  SESSIONS: "evcharge_sessions",
  PAYMENTS: "evcharge_payments",
}

// Initialize mock data
export function initializeDatabase() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(DB_KEYS.STATIONS)) {
    localStorage.setItem(DB_KEYS.STATIONS, JSON.stringify(mockStations))
  }
  if (!localStorage.getItem(DB_KEYS.CHARGERS)) {
    localStorage.setItem(DB_KEYS.CHARGERS, JSON.stringify(mockChargers))
  }
  if (!localStorage.getItem(DB_KEYS.BOOKINGS)) {
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(mockBookings))
  }
  if (!localStorage.getItem(DB_KEYS.SESSIONS)) {
    localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify([]))
  }
  if (!localStorage.getItem(DB_KEYS.PAYMENTS)) {
    localStorage.setItem(DB_KEYS.PAYMENTS, JSON.stringify([]))
  }
}

// Stations
export function getStations(): Station[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(DB_KEYS.STATIONS)
  return data ? JSON.parse(data) : []
}

export function getStation(id: string): Station | null {
  const stations = getStations()
  return stations.find((s) => s.id === id) || null
}

export function updateStation(station: Station): void {
  const stations = getStations()
  const index = stations.findIndex((s) => s.id === station.id)
  if (index !== -1) {
    stations[index] = { ...station, updated_at: new Date().toISOString() }
    localStorage.setItem(DB_KEYS.STATIONS, JSON.stringify(stations))
  }
}

export function createStation(station: Omit<Station, "id" | "created_at" | "updated_at">): Station {
  const stations = getStations()
  const newStation: Station = {
    ...station,
    id: `station-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  stations.push(newStation)
  localStorage.setItem(DB_KEYS.STATIONS, JSON.stringify(stations))
  return newStation
}

// Bookings
export function getBookings(): Booking[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(DB_KEYS.BOOKINGS)
  return data ? JSON.parse(data) : []
}

export function getUserBookings(userId: string): Booking[] {
  return getBookings().filter((b) => b.user_id === userId)
}

export function createBooking(booking: Omit<Booking, "id" | "created_at">): Booking {
  const bookings = getBookings()
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`,
    created_at: new Date().toISOString(),
  }
  bookings.push(newBooking)
  localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings))
  return newBooking
}

export function updateBooking(booking: Booking): void {
  const bookings = getBookings()
  const index = bookings.findIndex((b) => b.id === booking.id)
  if (index !== -1) {
    bookings[index] = booking
    localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings))
  }
}

// Chargers
export function getChargers(): Charger[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(DB_KEYS.CHARGERS)
  return data ? JSON.parse(data) : []
}

export function getStationChargers(stationId: string): Charger[] {
  return getChargers().filter((c) => c.station_id === stationId)
}
