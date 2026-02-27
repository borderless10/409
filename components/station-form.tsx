"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Station } from "@/lib/types"
import { updateStationById } from "@/lib/firestore"
import { geocodeAddress } from "@/lib/geocode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"

interface StationFormProps {
  station?: Station
}

export default function StationForm({ station }: StationFormProps) {
  const router = useRouter()
  const isEdit = Boolean(station)

  const [form, setForm] = useState({
    name: station?.name ?? "",
    address: station?.address ?? "",
    city: station?.city ?? "",
    state: station?.state ?? "",
    latitude: station?.latitude ?? 0,
    longitude: station?.longitude ?? 0,
    total_chargers: station?.total_chargers ?? 1,
    available_chargers: station?.available_chargers ?? 1,
    price_per_kwh: station?.price_per_kwh ?? 0.5,
    status: station?.status ?? "active",
  })
  const [geocoding, setGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  async function handleGeocode() {
    setGeoError(null)
    if (!form.address?.trim()) {
      setGeoError("Preencha o endereço antes de buscar.")
      return
    }
    setGeocoding(true)
    try {
      const result = await geocodeAddress(
        form.address.trim(),
        form.city.trim(),
        form.state.trim()
      )
      if (result) {
        setForm((prev) => ({ ...prev, latitude: result.lat, longitude: result.lon }))
      } else {
        setGeoError("Endereço não encontrado. Ajuste o texto ou informe latitude/longitude manualmente.")
      }
    } catch {
      setGeoError("Erro ao buscar coordenadas. Tente informar latitude e longitude manualmente.")
    } finally {
      setGeocoding(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        e.target instanceof HTMLInputElement &&
        e.target.type === "number"
          ? Number(value)
          : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (isEdit && station) {
      await updateStationById(station.id, form)
    }
    router.push("/admin/stations-maneger")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar Estação" : "Nova Estação"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Endereço</Label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Cidade</Label>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2 space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Localização no mapa</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Defina as coordenadas para o marcador: use &quot;Buscar pelo endereço&quot; ou informe latitude e longitude manualmente.
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
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Total de carregadores</Label>
            <Input
              type="number"
              name="total_chargers"
              value={form.total_chargers}
              onChange={handleChange}
              min={1}
            />
          </div>

          <div>
            <Label>Disponíveis</Label>
            <Input
              type="number"
              name="available_chargers"
              value={form.available_chargers}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div>
            <Label>Preço por kWh</Label>
            <Input
              type="number"
              step="0.01"
              name="price_per_kwh"
              value={form.price_per_kwh}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Status</Label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="active">Ativa</option>
              <option value="maintenance">Manutenção</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>

            <Button type="submit">
              {isEdit ? "Salvar Alterações" : "Criar Estação"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
