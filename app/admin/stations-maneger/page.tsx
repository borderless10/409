"use client"

import { useState } from "react"
import Link from "next/link"
import { getStations, deleteStation } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"

export default function AdminStationsPage() {
  // 🔹 estado local reativo
  const [stations, setStations] = useState(getStations())

  function handleDelete(id: string) {
    const confirmed = confirm("Tem certeza que deseja excluir este posto?")
    if (!confirmed) return

    deleteStation(id)

    // 🔄 re-sincroniza a UI com a fonte de dados
    setStations(getStations())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Postos</h1>

        <div className="flex gap-2">
          <Link href="/admin/stations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Posto
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm">
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {stations.length === 0 && (
          <p className="text-muted-foreground">
            Nenhum posto cadastrado.
          </p>
        )}

        {stations.map((station) => (
          <Card key={station.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h2 className="font-semibold">{station.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {station.address}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/stations/${station.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(station.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
