"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

/* =========================
   MOCKS
========================= */

const monthSummary = {
  month: "Janeiro / 2026",
  totalRevenue: "R$ 135.185,05",
  totalRecharges: "R$ 75.380,71",
  totalDeposits: "R$ 59.804,34",
}

const stationsRevenue = [
  { station: "Posto Centro", revenue: "R$ 42.300,00", sessions: 812 },
  { station: "Posto Zona Norte", revenue: "R$ 38.120,00", sessions: 645 },
  { station: "Posto Shopping Sul", revenue: "R$ 29.540,00", sessions: 503 },
  { station: "Posto BR-101", revenue: "R$ 25.225,05", sessions: 478 },
]

/* =========================
   PAGE
========================= */

export default function FinanceiroPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das receitas por posto
          </p>
        </div>

        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Resumo mensal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Receita total — {monthSummary.month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthSummary.totalRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Recargas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthSummary.totalRecharges}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Depósitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{monthSummary.totalDeposits}</p>
          </CardContent>
        </Card>
      </div>

      {/* Receita por posto */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por posto</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
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
                    {item.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
