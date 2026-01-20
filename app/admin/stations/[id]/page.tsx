"use client"

import { useParams } from "next/navigation"
import { getStationById } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StationDetailsPage() {
  const { id } = useParams()
  const station = getStationById(id as string)

  if (!station) {
    return <p>Estação não encontrada.</p>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{station.name}</CardTitle>
        </CardHeader>

        <CardContent>
          <p><strong>Endereço:</strong> {station.address}</p>
          <p><strong>Cidade:</strong> {station.city} - {station.state}</p>
          <p><strong>Status:</strong> {station.status}</p>
        </CardContent>
      </Card>
    </div>
  )
}
