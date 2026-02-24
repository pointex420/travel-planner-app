import type { LatLng } from '../../types/geo'

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Haversine: gute Näherung für Luftlinie auf der Erde
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371 // Erdradius km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)))
  return R * c
}

// grobe Schätzung (MVP): Durchschnittsgeschwindigkeit je nach Distanz
export function estimateDurationMin(distanceKmValue: number): number {
  // kurze Strecken eher Auto/Bus ~60km/h, lange eher Flug/Express ~450km/h (MVP-Heuristik)
  const speedKmh = distanceKmValue < 300 ? 60 : 450
  return Math.max(15, Math.round((distanceKmValue / speedKmh) * 60))
}