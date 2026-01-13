"use client"

import { useEffect, useRef } from "react"
import type { Station } from "@/lib/types"

declare global {
  interface Window {
    google: any
  }
}

interface StationMapProps {
  stations: Station[]
  onStationSelect?: (station: Station) => void
}

export default function StationMap({ stations, onStationSelect }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (typeof window === "undefined" || !mapRef.current) return

      // Check if Google Maps is already loaded
      if (window.google?.maps) {
        initializeMap()
        return
      }

      // Load Google Maps script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=marker`
      script.async = true
      script.defer = true
      script.onload = () => initializeMap()
      document.head.appendChild(script)
    }

    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return

      // Center on São Paulo
      const center = { lat: -23.5505, lng: -46.6333 }

      const { Map } = await window.google.maps.importLibrary("maps")
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker")

      const map = new Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapId: "evcharge_map",
        disableDefaultUI: false,
        zoomControl: true,
      })

      googleMapRef.current = map

      // Clear existing markers
      markersRef.current.forEach((marker) => (marker.map = null))
      markersRef.current = []

      // Add markers for each station
      stations.forEach((station) => {
        const pinBackground = new PinElement({
          background: station.available_chargers > 0 ? "#4ade80" : "#ef4444",
          borderColor: "#ffffff",
          glyphColor: "#ffffff",
        })

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: station.latitude, lng: station.longitude },
          title: station.name,
          content: pinBackground.element,
        })

        // Add click listener
        marker.addListener("click", () => {
          if (onStationSelect) {
            onStationSelect(station)
          }

          // Center map on selected station
          map.panTo({ lat: station.latitude, lng: station.longitude })
          map.setZoom(15)

          // Create info window content
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 250px;">
                <h3 style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${station.name}</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 8px;">${station.address}</p>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                  <span style="color: #666;">Disponível:</span>
                  <span style="font-weight: 500;">${station.available_chargers}/${station.total_chargers}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span style="color: #666;">Preço:</span>
                  <span style="font-weight: 500;">R$ ${station.price_per_kwh.toFixed(2)}/kWh</span>
                </div>
              </div>
            `,
          })

          infoWindow.open(map, marker)
        })

        markersRef.current.push(marker)
      })

      // Fit bounds to show all markers
      if (stations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        stations.forEach((station) => {
          bounds.extend({ lat: station.latitude, lng: station.longitude })
        })
        map.fitBounds(bounds)
      }
    }

    loadGoogleMaps()
  }, [stations, onStationSelect])

  return <div ref={mapRef} className="h-[600px] w-full rounded-lg border shadow-sm" />
}
