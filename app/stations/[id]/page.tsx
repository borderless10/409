"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStation } from "@/lib/db"
import type { Station } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Zap, DollarSign, Clock } from "lucide-react"
import Link from "next/link"

export default function StationDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [station, setStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stationData = getStation(params.id)
    setStation(stationData)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!station) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Estação não encontrada</h2>
          <Link href="/">
            <Button className="mt-4">Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{station.name}</h1>
          <p className="flex items-center gap-2 text-muted-foreground mt-2">
            <MapPin className="h-4 w-4" />
            {station.address}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Carregadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {station.available_chargers}/{station.total_chargers}
              </div>
              <p className="text-sm text-muted-foreground">disponíveis agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Preço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {station.price_per_kwh.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">por kWh</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Potência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{station.power_output}</div>
              <p className="text-sm text-muted-foreground">de saída</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Conectores</CardTitle>
              <CardDescription>Conectores disponíveis nesta estação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {station.connector_types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-sm">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
              <CardDescription>Serviços e facilidades disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-sm">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reserve seu Horário</CardTitle>
            <CardDescription>Garanta seu carregador e evite filas</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/stations/${station.id}/book`}>
              <Button size="lg" className="w-full" disabled={station.available_chargers === 0}>
                {station.available_chargers > 0 ? "Fazer Reserva" : "Sem Carregadores Disponíveis"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
