"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getStationsWithCounts, getBookings } from "@/lib/firestore"
import type { Station, Booking } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, Clock, DollarSign, ArrowRight, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stations, setStations] = useState<Station[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [periodType, setPeriodType] = useState<"total" | "year" | "month">("total")
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>()
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getStationsWithCounts(), getBookings()]).then(([s, b]) => {
      setStations(s)
      setBookings(b)
      setLoading(false)
    })
  }, [])

  const bookingsForStation = useMemo(
    () =>
      selectedStationId != null
        ? bookings.filter((b) => b.station_id === selectedStationId)
        : bookings,
    [bookings, selectedStationId]
  )

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const b of bookingsForStation) {
      const d = new Date(b.start_time)
      if (!Number.isNaN(d.getTime())) years.add(d.getFullYear())
    }
    return Array.from(years).sort((a, b) => b - a)
  }, [bookingsForStation])

  const availableMonthsByYear = useMemo(() => {
    const map: Record<number, number[]> = {}
    for (const b of bookingsForStation) {
      const d = new Date(b.start_time)
      if (Number.isNaN(d.getTime())) continue
      const y = d.getFullYear()
      if (!map[y]) map[y] = []
      if (!map[y].includes(d.getMonth())) map[y].push(d.getMonth())
    }
    for (const y of Object.keys(map)) {
      map[Number(y)].sort((a, b) => a - b)
    }
    return map
  }, [bookingsForStation])

  useEffect(() => {
    if (availableYears.length === 0) {
      setSelectedYear(undefined)
      setSelectedMonth(undefined)
      return
    }

    setSelectedYear((prev) =>
      prev != null && availableYears.includes(prev) ? prev : availableYears[0]
    )

    if (periodType === "month") {
      const effectiveYear =
        selectedYear != null && availableYears.includes(selectedYear)
          ? selectedYear
          : availableYears[0]
      const months = availableMonthsByYear[effectiveYear] ?? []
      if (months.length === 0) {
        setSelectedMonth(undefined)
        return
      }
      setSelectedMonth((prev) =>
        prev != null && months.includes(prev) ? prev : months[0]
      )
    }
  }, [availableYears, availableMonthsByYear, periodType, selectedYear])

  const filteredBookings = useMemo(() => {
    if (bookings.length === 0) return []
    return bookings.filter((b) => {
      if (selectedStationId != null && b.station_id !== selectedStationId) return false
      const d = new Date(b.start_time)
      if (Number.isNaN(d.getTime())) return false
      if (periodType === "total") return true
      if (selectedYear == null) return false
      if (d.getFullYear() !== selectedYear) return false
      if (periodType === "year") return true
      if (selectedMonth == null) return false
      return d.getMonth() === selectedMonth
    })
  }, [bookings, periodType, selectedYear, selectedMonth, selectedStationId])

  const summary = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        label: "Sem dados",
        totalRevenue: 0,
        totalSessions: 0,
        avgTicket: 0,
      }
    }

    const paid = filteredBookings.filter((b) => b.payment_status === "paid")
    const totalRevenue = paid.reduce((sum, b) => sum + (b.total_cost ?? 0), 0)
    const totalSessions = paid.length
    const avgTicket = totalSessions > 0 ? totalRevenue / totalSessions : 0

    let label = "Total"
    if (periodType === "year" && selectedYear != null) {
      label = `Ano ${selectedYear}`
    } else if (periodType === "month" && selectedYear != null && selectedMonth != null) {
      const d = new Date(selectedYear, selectedMonth, 1)
      const monthLabel = d.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
      label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
    }

    return {
      label,
      totalRevenue,
      totalSessions,
      avgTicket,
    }
  }, [filteredBookings, periodType, selectedYear, selectedMonth])

  const stationsRevenue = useMemo(() => {
    if (filteredBookings.length === 0) return []
    const stationMap = new Map<string, Station>(stations.map((s) => [s.id, s]))
    const agg = new Map<string, { sessions: number; revenue: number }>()

    for (const b of filteredBookings) {
      const key = b.station_id
      if (!agg.has(key)) {
        agg.set(key, { sessions: 0, revenue: 0 })
      }
      const entry = agg.get(key)!
      entry.sessions += 1
      entry.revenue += b.total_cost ?? 0
    }

    return Array.from(agg.entries())
      .map(([stationId, data]) => {
        const s = stationMap.get(stationId)
        return {
          id: stationId,
          name: s?.name ?? "Estação desconhecida",
          city: s?.city,
          state: s?.state,
          sessions: data.sessions,
          revenue: data.revenue,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings, stations])

  const filteredStations = useMemo(
    () =>
      selectedStationId != null
        ? stations.filter((s) => s.id === selectedStationId)
        : stations,
    [stations, selectedStationId]
  )

  const totalChargers = filteredStations.reduce(
    (sum, s) => sum + (s.total_chargers ?? 0),
    0
  )
  const availableChargers = filteredStations.reduce(
    (sum, s) => sum + (s.available_chargers ?? 0),
    0
  )
  const availability =
    totalChargers > 0 ? ((availableChargers / totalChargers) * 100).toFixed(0) : "0"
  const occupancy =
    totalChargers > 0 ? (100 - Number.parseFloat(availability)).toFixed(0) : "0"

  const activeBookingsNow =
    selectedStationId != null
      ? bookings.filter(
          (b) => b.status === "active" && b.station_id === selectedStationId
        ).length
      : bookings.filter((b) => b.status === "active").length
  const completedBookingsInPeriod = filteredBookings.filter(
    (b) => b.status === "completed"
  ).length

  const activeStations = filteredStations.filter((s) => s.status === "active").length
  const maintenanceStations = filteredStations.filter(
    (s) => s.status === "maintenance"
  ).length
  const inactiveStations = filteredStations.filter((s) => s.status === "inactive").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho + filtros de período */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral operacional e financeira das suas estações
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Período:</span>
            <div className="inline-flex rounded-md border bg-muted/50 p-1 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded ${
                  periodType === "total"
                    ? "bg-background font-semibold shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setPeriodType("total")}
              >
                Total
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded ${
                  periodType === "year"
                    ? "bg-background font-semibold shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setPeriodType("year")}
              >
                Ano
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded ${
                  periodType === "month"
                    ? "bg-background font-semibold shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => setPeriodType("month")}
              >
                Mês
              </button>
            </div>
          </div>

          {availableYears.length > 0 && periodType !== "total" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ano</span>
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={selectedYear ?? ""}
                onChange={(e) => {
                  const year = Number(e.target.value)
                  setSelectedYear(Number.isNaN(year) ? undefined : year)
                  const months = availableMonthsByYear[year]
                  if (months && months.length > 0) {
                    setSelectedMonth(months[0])
                  } else {
                    setSelectedMonth(undefined)
                  }
                }}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {periodType === "month" && selectedYear != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mês</span>
              <select
                className="h-8 rounded-md border bg-background px-2 text-xs"
                value={selectedMonth ?? ""}
                onChange={(e) => {
                  const m = Number(e.target.value)
                  setSelectedMonth(Number.isNaN(m) ? undefined : m)
                }}
              >
                {(availableMonthsByYear[selectedYear] ?? []).map((m) => {
                  const d = new Date(selectedYear, m, 1)
                  const label = d.toLocaleDateString("pt-BR", { month: "long" })
                  const normalized = label.charAt(0).toUpperCase() + label.slice(1)
                  return (
                    <option key={m} value={m}>
                      {normalized}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Estação:</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-xs min-w-[180px]"
              value={selectedStationId ?? ""}
              onChange={(e) => {
                const v = e.target.value
                setSelectedStationId(v === "" ? null : v)
              }}
            >
              <option value="">Todas as estações</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Receita — {summary.label}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">
              {summary.totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ticket médio:{" "}
              {summary.avgTicket.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recargas no período</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">{completedBookingsInPeriod}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeBookingsNow} reserva(s) ativa(s) agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de ocupação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">{occupancy}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {availableChargers}/{totalChargers} carregadores livres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold">{filteredStations.length}</p>
            <p className="text-xs text-muted-foreground">
              {activeStations} ativas · {maintenanceStations} em manutenção ·{" "}
              {inactiveStations} inativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid principal: visão operacional + financeiro por estação */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr] xl:grid-cols-[2.1fr,1.3fr]">
        {/* Lista de estações */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estações</CardTitle>
              <CardDescription>
                Status e capacidade das estações cadastradas
              </CardDescription>
            </div>
            <Link href="/admin/stations-maneger">
              <Button variant="outline" size="sm">
                Gerenciar estações
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            {stations.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-muted-foreground">
                Nenhuma estação cadastrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="py-2 px-6 text-left font-medium">Estação</th>
                      <th className="py-2 px-4 text-left font-medium">Localização</th>
                      <th className="py-2 px-4 text-left font-medium">Carregadores</th>
                      <th className="py-2 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b last:border-none hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2 px-6 align-top">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ID: {s.id.slice(0, 6).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-2 px-4 align-top text-xs text-muted-foreground">
                          {s.city} · {s.state}
                        </td>
                        <td className="py-2 px-4 align-top text-xs">
                          <Badge variant="outline">
                            {(s.available_chargers ?? 0)}/{(s.total_chargers ?? 0)} livres
                          </Badge>
                        </td>
                        <td className="py-2 px-4 align-top">
                          <Badge
                            variant={
                              s.status === "active"
                                ? "default"
                                : s.status === "maintenance"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {s.status === "active" && "Ativa"}
                            {s.status === "maintenance" && "Manutenção"}
                            {s.status === "inactive" && "Inativa"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receita por estação */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Receita por estação</CardTitle>
              <CardDescription>
                Estações com maior faturamento no período selecionado
              </CardDescription>
            </div>
            <Link href="/admin/expenses">
              <Button variant="outline" size="sm">
                Ver financeiro
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            {stationsRevenue.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-muted-foreground">
                Ainda não há receita registrada no período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="py-2 px-6 text-left font-medium">Estação</th>
                      <th className="py-2 px-4 text-left font-medium">Receita</th>
                      <th className="py-2 px-4 text-left font-medium">Recargas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stationsRevenue.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b last:border-none hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2 px-6 align-top">
                          <div className="font-medium">{row.name}</div>
                          {row.city && row.state && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {row.city} · {row.state}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-4 align-top font-medium">
                          {row.revenue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2 px-4 align-top text-xs text-muted-foreground">
                          {row.sessions} recarga(s)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
