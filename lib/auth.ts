type User = {
  name: string
  email: string
  role?: "user" | "admin"
}

const STORAGE_KEY = "auth:user"

export function login(email: string, password: string): boolean {
  if (password !== "password") return false

  const user: User = {
    name: "Usuário",
    email,
    role: email.includes("admin") ? "admin" : "user",
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return true
}

export function register(name: string, email: string, password: string): boolean {
  const user: User = {
    name,
    email,
    role: email.includes("admin") ? "admin" : "user",
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return true
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return null

  try {
    return JSON.parse(data) as User
  } catch {
    return null
  }
}
