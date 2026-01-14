"use client"

import { useAuth } from "@/src/contexts/AuthContext"

export default function Test() {
  const auth = useAuth()
  return <pre>{JSON.stringify(auth)}</pre>
}
