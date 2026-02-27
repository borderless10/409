"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-firebase"
import { createStation } from "@/lib/firestore"
import { geocodeAddress } from "@/lib/geocode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NewStation() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    price_per_kwh: "",
  })
  const [connectorTypes, setConnectorTypes] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [newConnector, setNewConnector] = useState("")
  const [newAmenity, setNewAmenity] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [router])

  const lat = Number.parseFloat(formData.latitude)
  const lng = Number.parseFloat(formData.longitude)
  const hasValidCoords =
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  const isZeroZero = hasValidCoords && lat === 0 && lng === 0

  const handleGeocode = async () => {
    setGeoError(null)
    if (!formData.address?.trim()) {
      setGeoError("Preencha o endereço antes de buscar.")
      return
    }
    setGeocoding(true)
    try {
      const result = await geocodeAddress(
        formData.address.trim(),
        formData.city.trim(),
        formData.state.trim()
      )
      if (result) {
        setFormData((prev) => ({
          ...prev,
          latitude: String(result.lat),
          longitude: String(result.lon),
        }))
      } else {
        setGeoError("Endereço não encontrado. Ajuste o texto ou informe latitude/longitude manualmente.")
      }
    } catch {
      setGeoError("Erro ao buscar coordenadas. Tente informar latitude e longitude manualmente.")
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCurrentUser()
    if (!user) return
    if (!hasValidCoords || isZeroZero) {
      const msg =
        "A localização no mapa está vazia ou (0, 0). A estação pode aparecer no lugar errado. Use \"Buscar pelo endereço\" ou preencha Latitude e Longitude manualmente. Deseja mesmo criar?"
      if (typeof window !== "undefined" && !window.confirm(msg)) return
    }
    setSubmitting(true)
    try {
      await createStation({
        name: formData.name,
        address: formData.address,
        city: formData.city || "—",
        state: formData.state || "—",
        latitude: hasValidCoords ? lat : 0,
        longitude: hasValidCoords ? lng : 0,
        price_per_kwh: Number.parseFloat(formData.price_per_kwh) || 0,
        connector_types: connectorTypes,
        amenities: amenities,
        status: "active",
        owner_id: user.id,
      })
      router.push("/admin/stations-maneger")
    } finally {
      setSubmitting(false)
    }
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
    <div className="mx-auto max-w-2xl">
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
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base">Localização no mapa</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Defina as coordenadas para o marcador no mapa: use o botão abaixo com o endereço preenchido ou informe latitude e longitude manualmente.
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeocode}
                    disabled={geocoding}
                  >
                    {geocoding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Buscando...</span>
                      </>
                    ) : (
                      "Buscar pelo endereço"
                    )}
                  </Button>
                </div>
                {geoError && (
                  <p className="text-sm text-destructive">{geoError}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Ex: -23.5505"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Ex: -46.6333"
                    />
                  </div>
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
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar Estação"}
                </Button>
                <Link href="/admin/stations-maneger" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
