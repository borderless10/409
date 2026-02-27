/**
 * Geocoding via Nominatim (OpenStreetMap). Uso: buscar lat/lng a partir de endereço.
 * Política de uso: https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeocodeResult {
  lat: number
  lon: number
  display_name: string
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string
): Promise<GeocodeResult | null> {
  const parts = [address, city, state].filter(Boolean)
  if (parts.length === 0) return null
  const query = parts.join(", ")
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "pt-BR",
      "User-Agent": "BorderlessEV/1.0 (admin-station-form)",
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  const first = data[0]
  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  return {
    lat,
    lon,
    display_name: first.display_name ?? "",
  }
}
