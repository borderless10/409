"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { getStationById } from "@/lib/db"
import type { Station } from "@/lib/types"

import StationForm from "@/components/station-form"

export default function EditStationPage() {
  const router = useRouter()
  const params = useParams()
  const stationId = params.id as string

  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()

    // 🔐 Proteção da rota admin
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    const data = getStationById(stationId)

    if (!data) {
      router.push("/admin/stations")
      return
    }

    setStation(data)
    setLoading(false)
  }, [router, stationId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">
            Carregando estação...
          </p>
        </div>
      </div>
    )
  }

  if (!station) return null

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <StationForm station={station} />
    </div>
  )
}
