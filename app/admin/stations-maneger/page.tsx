"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { getStations, getBookings } from "@/lib/db"
import type { Station, Booking } from "@/lib/types"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Plus
} from "lucide-react"

import { cn } from "@/lib/utils"

export default function AdminStationsPage() {
  const router = useRouter()

  const [stations, setStations] = useState<Station[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()

    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    setStations(getStations())
    setBookings(getBookings())
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalChargers = stations.reduce((sum, s) => sum + s.total_chargers, 0)
  const availableChargers = stations.reduce((sum, s) => sum + s.available_chargers, 0)
  const availability =
    totalChargers > 0 ? ((availableChargers / totalChargers) * 100).toFixed(0) : "0"

  const activeBookings = bookings.filter((b) => b.status === "active").length
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.total_cost || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">EV Charge Admin</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">Ver App</Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("evcharge_current_user")
                router.push("/login")
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* TÍTULO */}
        <div>
          <h2 className="text-3xl font-bold">Estações</h2>
          <p className="text-muted-foreground">
            Gerencie e monitore suas estações de recarga
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Estações</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stations.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalChargers} carregadores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableChargers}</div>
              <p className="text-xs text-muted-foreground">
                {availability}% disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LISTA DE ESTAÇÕES */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estações</CardTitle>
                <CardDescription>Clique para ver detalhes</CardDescription>
              </div>
              <Link href="/admin/stations/new">
                <Button
                  size="icon"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              </Link>

            </CardHeader>

            <CardContent className="space-y-2">
              {stations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    selectedStation?.id === station.id
                      ? "border-primary bg-muted"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {station.city} • {station.state}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">
                      {station.available_chargers}/{station.total_chargers} livres
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* DETALHES */}
          {selectedStation ? (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedStation.name}</CardTitle>
                <CardDescription>
                  {selectedStation.city} - {selectedStation.state}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                    <TabsTrigger value="transactions">Transações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="flex gap-2">
                      <Badge>{selectedStation.total_chargers} carregadores</Badge>
                      <Badge variant="secondary">
                        {selectedStation.available_chargers} disponíveis
                      </Badge>
                    </div>

                    <Link href={`/admin/stations/edit/${selectedStation.id}`}>
                    <Button variant="outline">Editar Estação</Button>
                    </Link>
                  </TabsContent>

                  <TabsContent value="events">
                    <p className="text-sm text-muted-foreground">
                      Eventos da estação (mock)
                    </p>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <p className="text-sm text-muted-foreground">
                      Transações da estação (mock)
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 flex items-center justify-center">
              <p className="text-muted-foreground">
                Selecione uma estação para ver os detalhes
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
