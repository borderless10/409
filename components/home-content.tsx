"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStations } from "@/lib/db"
import type { Station } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Zap, MapPin, Search, User, LogOut } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const StationMap = dynamic(() => import("@/components/station-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted">
      <p className="text-muted-foreground">Carregando mapa...</p>
    </div>
  ),
})

export default function HomeContent() {
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [stations, setStations] = useState<Station[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setStations(getStations())
  }, [router])

  const filteredStations = stations.filter(
    (station) =>
      station.status === "active" &&
      (station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleLogout = () => {
    localStorage.removeItem("evcharge_current_user")
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">EV Charge</h1>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>

                <Link href="/admin/expenses">
                  <Button variant="outline" size="sm">
                    Financeiro
                  </Button>
                </Link>
              </>
            )}

            <Link href="/bookings">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Minhas Reservas
              </Button>
            </Link>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-3xl font-bold">Encontre Estações de Recarga</h2>
          <p className="text-muted-foreground">
            Localize a estação mais próxima e reserve seu horário
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou endereço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            size="sm"
            className={viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-transparent"}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Mapa
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
            className={viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-transparent"}
          >
            Lista
          </Button>
        </div>

        {viewMode === "map" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StationMap stations={filteredStations} onStationSelect={setSelectedStation} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {filteredStations.length} estações encontradas
              </h3>

              <div className="space-y-3">
                {filteredStations.slice(0, 5).map((station) => (
                  <Card
                    key={station.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStation?.id === station.id
                        ? "border-primary ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedStation(station)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{station.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {station.address}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Disponível</span>
                        <span className="font-medium text-primary">
                          {station.available_chargers}/{station.total_chargers}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Preço</span>
                        <span className="font-medium">
                          R$ {station.price_per_kwh.toFixed(2)}/kWh
                        </span>
                      </div>

                      <Link href={`/stations/${station.id}`}>
                        <Button size="sm" className="mt-2 w-full">
                          Reservar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStations.map((station) => (
              <Card key={station.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription>{station.address}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
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
                    <span className="font-medium">
                      R$ {station.price_per_kwh.toFixed(2)}/kWh
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {station.connector_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  {station.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {station.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Link href={`/stations/${station.id}`}>
                    <Button size="sm" className="mt-2 w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
