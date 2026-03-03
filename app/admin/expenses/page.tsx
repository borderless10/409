"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBookings, getStations } from "@/lib/firestore"
import type { Booking, Station } from "@/lib/types"

type PeriodType = "total" | "year" | "month"

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

export default function FinanceiroPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stations, setStations] = useState<Station[]>([])

  const [periodType, setPeriodType] = useState<PeriodType>("total")
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableMonthsByYear, setAvailableMonthsByYear] = useState<Record<number, number[]>>(
    {}
  )
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>() // 0-11

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [allBookings, allStations] = await Promise.all([getBookings(), getStations()])
        if (cancelled) return

        // Considera apenas reservas pagas com valor calculado
        const paidBookings = allBookings.filter(
          (b) => b.payment_status === "paid" && typeof b.total_cost === "number"
        )

        setBookings(paidBookings)
        setStations(allStations)

        if (paidBookings.length > 0) {
          const yearSet = new Set<number>()
          const monthsMap = new Map<number, Set<number>>()

          for (const b of paidBookings) {
            const d = new Date(b.start_time)
            if (Number.isNaN(d.getTime())) continue
            const y = d.getFullYear()
            const m = d.getMonth()
            yearSet.add(y)
            if (!monthsMap.has(y)) monthsMap.set(y, new Set<number>())
            monthsMap.get(y)!.add(m)
          }

          const years = Array.from(yearSet).sort((a, b) => a - b)
          setAvailableYears(years)

          const monthsByYear: Record<number, number[]> = {}
          for (const [y, monthsSet] of monthsMap.entries()) {
            monthsByYear[y] = Array.from(monthsSet).sort((a, b) => a - b)
          }
          setAvailableMonthsByYear(monthsByYear)

          const firstYear = years[0]
          setSelectedYear(firstYear)
          const firstYearMonths = monthsByYear[firstYear]
          if (firstYearMonths && firstYearMonths.length > 0) {
            setSelectedMonth(firstYearMonths[0])
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredBookings = useMemo(() => {
    if (bookings.length === 0) return []
    return bookings.filter((b) => {
      const d = new Date(b.start_time)
      if (Number.isNaN(d.getTime())) return false
      if (periodType === "total") return true
      if (!selectedYear) return false
      if (d.getFullYear() !== selectedYear) return false
      if (periodType === "year") return true
      if (selectedMonth == null) return false
      return d.getMonth() === selectedMonth
    })
  }, [bookings, periodType, selectedYear, selectedMonth])

  const summary = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        label: "Sem dados",
        totalRevenue: 0,
        totalRecharges: 0,
        totalDeposits: 0,
      }
    }

    const totalRevenue = filteredBookings.reduce(
      (sum, b) => sum + (b.total_cost ?? 0),
      0
    )

    let label = "Total"
    if (periodType === "year" && selectedYear) {
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
      // Por enquanto consideramos que toda receita vem das recargas.
      totalRecharges: totalRevenue,
      // Depósitos podem ser integrados depois; começamos zerado.
      totalDeposits: 0,
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
      .map(([stationId, data]) => ({
        station: stationMap.get(stationId)?.name ?? "Estação desconhecida",
        sessions: data.sessions,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings, stations])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando financeiro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das receitas por posto
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Período:</span>
            <div className="inline-flex rounded-md border bg-muted/50 p-1 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded ${periodType === "total" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setPeriodType("total")}
              >
                Total
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded ${periodType === "year" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setPeriodType("year")}
              >
                Ano
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded ${periodType === "month" ? "bg-background font-semibold shadow-sm" : "text-muted-foreground"}`}
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

          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Receita total — {summary.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyBRL(summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Recargas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyBRL(summary.totalRecharges)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Depósitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyBRL(summary.totalDeposits)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receita por posto */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por posto</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {stationsRevenue.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Ainda não há reservas pagas no período selecionado.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    Posto
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Sessões
                  </th>
                  <th className="px-6 py-3 text-right font-medium">
                    Receita
                  </th>
                </tr>
              </thead>

              <tbody>
                {stationsRevenue.map((item) => (
                  <tr
                    key={item.station}
                    className="border-b last:border-none hover:bg-muted/30 transition"
                  >
                    <td className="px-6 py-4">
                      {item.station}
                    </td>
                    <td className="px-6 py-4">
                      {item.sessions}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrencyBRL(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
