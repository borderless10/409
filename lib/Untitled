let googleMapsPromise: Promise<void> | null = null

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.google?.maps) {
    return Promise.resolve()
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&v=weekly`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject("Failed to load Google Maps")
      document.head.appendChild(script)
    })
  }

  return googleMapsPromise
}
