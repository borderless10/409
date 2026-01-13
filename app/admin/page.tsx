"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { getStations, getBookings } from "@/lib/db"
import type { Station, Booking } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, MapPin, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [stations, setStations] = useState<Station[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !isAdmin()) {
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalChargers = stations.reduce((sum, s) => sum + s.total_chargers, 0)
  const availableChargers = stations.reduce((sum, s) => sum + s.available_chargers, 0)
  const activeBookings = bookings.filter((b) => b.status === "active").length
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + (b.total_cost || 0), 0)

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Gerencie suas estações de recarga</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Estações</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stations.length}</div>
              <p className="text-xs text-muted-foreground">{totalChargers} carregadores totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregadores Disponíveis</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableChargers}</div>
              <p className="text-xs text-muted-foreground">
                {((availableChargers / totalChargers) * 100).toFixed(0)}% disponibilidade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings}</div>
              <p className="text-xs text-muted-foreground">{bookings.length} reservas totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stations">Estações</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Minhas Estações</h3>
                <p className="text-sm text-muted-foreground">Gerencie todas as estações de recarga</p>
              </div>
              <Link href="/admin/stations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Estação
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {stations.map((station) => (
                <Card key={station.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{station.name}</CardTitle>
                        <CardDescription className="mt-1">{station.address}</CardDescription>
                      </div>
                      <Badge
                        variant={station.status === "active" ? "default" : "secondary"}
                        className={station.status === "active" ? "bg-primary text-primary-foreground" : ""}
                      >
                        {station.status === "active" ? "Ativa" : "Manutenção"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Carregadores</span>
                        <span className="font-medium">
                          {station.available_chargers}/{station.total_chargers} disponíveis
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Potência</span>
                        <span className="font-medium">{station.power_output}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Preço</span>
                        <span className="font-medium">R$ {station.price_per_kwh.toFixed(2)}/kWh</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {station.connector_types.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-2">
                        <Link href={`/admin/stations/${station.id}`}>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Reservas Recentes</h3>
              <p className="text-sm text-muted-foreground">Acompanhe todas as reservas do sistema</p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Estação</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Horário</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((booking) => {
                        const station = stations.find((s) => s.id === booking.station_id)
                        return (
                          <tr key={booking.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-mono">{booking.id.slice(0, 8)}</td>
                            <td className="px-4 py-3 text-sm">{station?.name}</td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(booking.start_time).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  booking.status === "active"
                                    ? "default"
                                    : booking.status === "completed"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={booking.status === "active" ? "bg-primary text-primary-foreground" : ""}
                              >
                                {booking.status === "active" && "Ativa"}
                                {booking.status === "completed" && "Concluída"}
                                {booking.status === "pending" && "Pendente"}
                                {booking.status === "cancelled" && "Cancelada"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {booking.total_cost ? `R$ ${booking.total_cost.toFixed(2)}` : "-"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={booking.payment_status === "paid" ? "default" : "outline"}
                                className={booking.payment_status === "paid" ? "bg-green-600 text-white" : ""}
                              >
                                {booking.payment_status === "paid" && "Pago"}
                                {booking.payment_status === "pending" && "Pendente"}
                                {booking.payment_status === "failed" && "Falhou"}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
