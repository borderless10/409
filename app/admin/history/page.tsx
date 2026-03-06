"use client"

import { useEffect, useState } from "react"
import { getActivityLog, getStations, getChargers } from "@/lib/firestore"
import type { ActivityLog, Station, Charger } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, MapPin, Zap, DollarSign } from "lucide-react"

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })
}

type ActivityLogPayload = ActivityLog["payload"]

function isPaymentPayload(p: ActivityLogPayload): p is import("@/lib/types").ActivityLogPayloadPayment {
  return "amount" in p && typeof (p as { amount?: number }).amount === "number"
}

export default function AdminHistoryPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [chargers, setChargers] = useState<Charger[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getActivityLog(100), getStations(), getChargers()]).then(([l, s, c]) => {
      setLogs(l)
      setStations(s)
      setChargers(c)
      setLoading(false)
    })
  }, [])

  const stationMap = new Map(stations.map((s) => [s.id, s]))
  const chargerMap = new Map(chargers.map((c) => [c.id, c]))

  const typeLabel: Record<ActivityLog["type"], string> = {
    booking_created: "Reserva criada",
    booking_cancelled: "Reserva cancelada",
    payment_completed: "Pagamento realizado",
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-muted-foreground">Ações recentes no sistema: reservas, cancelamentos e pagamentos.</p>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum registro no histórico ainda.
            </CardContent>
          </Card>
        ) : (
          logs.map((entry) => {
            const station = stationMap.get(entry.payload.station_id)
            const charger = chargerMap.get(entry.payload.charger_id)
            const stationName = station?.name ?? entry.payload.station_id
            const chargerNumber = charger?.charger_number ?? entry.payload.charger_id

            return (
              <Card key={entry.id} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <CardTitle className="text-base">{typeLabel[entry.type]}</CardTitle>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(entry.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {entry.actor_display || entry.actor_id || "—"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Estação: {stationName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      Carregador: {chargerNumber}
                    </span>
                    {"start_time" in entry.payload && entry.payload.start_time && (
                      <span className="text-muted-foreground">
                        Período: {formatDateTime(entry.payload.start_time)}
                        {entry.payload.end_time && ` – ${formatDateTime(entry.payload.end_time)}`}
                      </span>
                    )}
                    {isPaymentPayload(entry.payload) && (
                      <span className="flex items-center gap-1 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(entry.payload.amount)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
