import { useEffect, useRef } from "react"
import type { Station } from "@/lib/types"
import L from "leaflet"

interface StationMapProps {
  stations: Station[]
  onStationSelect?: (station: Station) => void
}

export default function StationMap({ stations, onStationSelect }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(
      [-23.5505, -46.6333], // São Paulo
      12
    )

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    mapInstanceRef.current = map
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove markers antigos
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const bounds = L.latLngBounds([])

    stations.forEach((station) => {
      if (
        typeof station.latitude !== "number" ||
        typeof station.longitude !== "number" ||
        isNaN(station.latitude) ||
        isNaN(station.longitude)
      ) {
        return
      }

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            background: ${station.available_chargers > 0 ? "#22c55e" : "#ef4444"};
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid white;
          "></div>
        `,
      })

      const marker = L.marker(
        [station.latitude, station.longitude],
        { icon }
      ).addTo(map)

      marker.on("click", () => {
        onStationSelect?.(station)

        marker.bindPopup(`
          <strong>${station.name}</strong><br/>
          ${station.address}<br/>
          <b>${station.available_chargers}/${station.total_chargers}</b> disponíveis<br/>
          R$ ${station.price_per_kwh.toFixed(2)}/kWh
        `).openPopup()
      })

      markersRef.current.push(marker)
      bounds.extend(marker.getLatLng())
    })

    if (stations.length) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [stations, onStationSelect])

  return (
    <div
      ref={mapRef}
      className="h-[600px] w-full rounded-lg border"
    />
  )
}
