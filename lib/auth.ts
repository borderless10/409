"use client"

import type { User } from "./types"
import { mockUsers } from "./mock-data"

const CURRENT_USER_KEY = "evcharge_current_user"

export function login(email: string, password: string): User | null {
  // Mock authentication - in production, this would call an API
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password") {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    return user
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin"
}
