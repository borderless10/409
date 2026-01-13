"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStation, createBooking } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { Station } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default function BookStation({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [station, setStation] = useState<Station | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [duration, setDuration] = useState("1")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    const stationData = getStation(params.id)
    setStation(stationData)
    setLoading(false)

    // Set default date to today
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)

    // Set default time to next hour
    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0)
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setSelectedTime(`${hours}:${minutes}`)
  }, [params.id, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!station) return

    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    const startTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const endTime = new Date(startTime.getTime() + Number.parseInt(duration) * 60 * 60 * 1000)

    const booking = createBooking({
      user_id: user.id,
      station_id: station.id,
      charger_id: "charger-1", // In a real app, this would be selected
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "pending",
      payment_status: "pending",
    })

    router.push(`/bookings/${booking.id}/payment`)
  }

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

  const estimatedCost = Number.parseInt(duration) * 40 * station.price_per_kwh

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/stations/${station.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Fazer Reserva</h1>
          <p className="text-muted-foreground mt-1">{station.name}</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Estação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Endereço</span>
                <span className="font-medium text-right">{station.address}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Carregadores Disponíveis</span>
                <span className="font-medium">
                  {station.available_chargers}/{station.total_chargers}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potência</span>
                <span className="font-medium">{station.power_output}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço</span>
                <span className="font-medium">R$ {station.price_per_kwh.toFixed(2)}/kWh</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selecione Data e Horário</CardTitle>
              <CardDescription>Escolha quando deseja utilizar o carregador</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário de Início
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Máximo de 8 horas por reserva</p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-medium">{duration}h</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Consumo Estimado</span>
                    <span className="font-medium">{Number.parseInt(duration) * 40} kWh</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Taxa por kWh</span>
                    <span className="font-medium">R$ {station.price_per_kwh.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-semibold">Valor Estimado</span>
                    <span className="text-lg font-bold text-primary">R$ {estimatedCost.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * O valor final será calculado com base no consumo real
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Continuar para Pagamento
                  </Button>
                  <Link href={`/stations/${station.id}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
