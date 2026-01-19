"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createStation } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NewStation() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    total_chargers: "",
    price_per_kwh: "",
    power_output: "",
  })
  const [connectorTypes, setConnectorTypes] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [newConnector, setNewConnector] = useState("")
  const [newAmenity, setNewAmenity] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const station = createStation({
      name: formData.name,
      address: formData.address,
      latitude: Number.parseFloat(formData.latitude),
      longitude: Number.parseFloat(formData.longitude),
      total_chargers: Number.parseInt(formData.total_chargers),
      available_chargers: Number.parseInt(formData.total_chargers),
      price_per_kwh: Number.parseFloat(formData.price_per_kwh),
      power_output: formData.power_output,
      connector_types: connectorTypes,
      amenities: amenities,
      status: "active",
      owner_id: "admin-1",
    })

    router.push("/admin")
  }

  const addConnectorType = () => {
    if (newConnector && !connectorTypes.includes(newConnector)) {
      setConnectorTypes([...connectorTypes, newConnector])
      setNewConnector("")
    }
  }

  const addAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity])
      setNewAmenity("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/stations-maneger/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nova Estação de Recarga</CardTitle>
            <CardDescription>Adicione uma nova estação ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Estação</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Shopping Center Norte"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Av. Example, 1234 - São Paulo, SP"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_chargers">Número de Carregadores</Label>
                  <Input
                    id="total_chargers"
                    type="number"
                    required
                    value={formData.total_chargers}
                    onChange={(e) => setFormData({ ...formData, total_chargers: e.target.value })}
                    placeholder="8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="power_output">Potência</Label>
                  <Input
                    id="power_output"
                    required
                    value={formData.power_output}
                    onChange={(e) => setFormData({ ...formData, power_output: e.target.value })}
                    placeholder="50 kW"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_kwh">Preço por kWh (R$)</Label>
                <Input
                  id="price_per_kwh"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_per_kwh}
                  onChange={(e) => setFormData({ ...formData, price_per_kwh: e.target.value })}
                  placeholder="0.89"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipos de Conectores</Label>
                <div className="flex gap-2">
                  <Input
                    value={newConnector}
                    onChange={(e) => setNewConnector(e.target.value)}
                    placeholder="Ex: CCS2, CHAdeMO, Type 2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addConnectorType()
                      }
                    }}
                  />
                  <Button type="button" onClick={addConnectorType} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {connectorTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <button
                        type="button"
                        onClick={() => setConnectorTypes(connectorTypes.filter((t) => t !== type))}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comodidades</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Ex: Wi-Fi, Café, Banheiro"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addAmenity()
                      }
                    }}
                  />
                  <Button type="button" onClick={addAmenity} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="gap-1">
                      {amenity}
                      <button
                        type="button"
                        onClick={() => setAmenities(amenities.filter((a) => a !== amenity))}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Estação
                </Button>
                <Link href="/admin" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
