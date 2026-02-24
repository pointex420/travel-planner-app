import type { TripRequest } from '../../types/trip'
import type { Itinerary, ItineraryDay, Stop } from '../../types/itinerary'
import type { Poi } from '../../types/poi'
import type { Transfer } from '../../types/transfer'
import { scorePoi } from '../../domain/scoring/scorePoi'
import { distanceKm, estimateDurationMin } from '../../services/route/FakeRouteService'

type ScoredPoi = { poi: Poi; score: number }

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function cityKey(p: Poi): string {
  return `${p.country}::${p.city}`.toLowerCase()
}

/**
 * Pick up to N cities based on:
 * - how many good POIs exist in the city
 * - how well they match the preferences
 */
function pickTopCities(scored: ScoredPoi[], maxStops: number): string[] {
  const byCity = new Map<string, { totalScore: number; count: number }>()

  for (const s of scored) {
    const key = cityKey(s.poi)
    const entry = byCity.get(key) ?? { totalScore: 0, count: 0 }
    entry.totalScore += s.score
    entry.count += 1
    byCity.set(key, entry)
  }

  return Array.from(byCity.entries())
    .sort((a, b) => {
      // primary: total city score, secondary: number of POIs
      if (b[1].totalScore !== a[1].totalScore) return b[1].totalScore - a[1].totalScore
      return b[1].count - a[1].count
    })
    .slice(0, maxStops)
    .map(([key]) => key)
}

function cityNameFromKey(key: string): { country: string; city: string } {
  const [country, city] = key.split('::')
  return { country, city }
}

function cityLocation(pois: Poi[]): { lat: number; lng: number } {
  // For MVP: take the first POI location as "city location"
  // Later you can use a real city center / geocoding.
  const first = pois[0]
  return { lat: first.location.lat, lng: first.location.lng }
}

function distributeDaysIntoStops(stopKeys: string[], totalDays: number): Stop[] {
  // We interpret "days" as nights/stop-days for MVP.
  // Each stop gets at least 1 night/day.
  const base = Math.max(1, Math.floor(totalDays / stopKeys.length))
  let remaining = totalDays - base * stopKeys.length

  return stopKeys.map((key) => {
    const { country, city } = cityNameFromKey(key)
    const extra = remaining > 0 ? 1 : 0
    if (remaining > 0) remaining -= 1
    return {
      city,
      country,
      location: { lat: 0, lng: 0 }, // filled later
      nights: base + extra,
      pois: [],
    }
  })
}

function buildTransfers(stops: Stop[]): Transfer[] {
  const transfers: Transfer[] = []
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    const km = distanceKm(a.location, b.location)
    transfers.push({
      fromCity: a.city,
      toCity: b.city,
      distanceKm: Math.round(km),
      durationMin: estimateDurationMin(km),
    })
  }
  return transfers
}

export function generateItinerary(req: TripRequest, pois: Poi[]): Itinerary {
  const { country, days, preferences } = req
  const maxPerDay = preferences.maxPoisPerDay

  // 1) Score all POIs
  const scored: ScoredPoi[] = pois
    .map((p) => ({ poi: p, score: scorePoi(p, preferences) }))
    .sort((a, b) => b.score - a.score)

  // 2) Choose stops (cities) based on best matching POIs
  // MVP: cap stops to keep results readable
  const maxStops = days <= 6 ? 2 : days <= 10 ? 3 : 4
  const stopKeys = pickTopCities(scored, maxStops)

  // Fallback: if for some reason no cities exist
  const safeStopKeys = stopKeys.length ? stopKeys : unique(pois.map(cityKey)).slice(0, 2)

  // 3) Distribute trip days into nights per stop
  const stops = distributeDaysIntoStops(safeStopKeys, days)

  // 4) Attach city location + pick POIs per stop
  // We assign POIs city-based, preferring high-score ones.
  const used = new Set<string>()

  for (const stop of stops) {
    const key = `${stop.country}::${stop.city}`.toLowerCase()
    const cityPoisScored = scored.filter((x) => cityKey(x.poi) === key)

    if (cityPoisScored.length > 0) {
      stop.location = cityLocation(cityPoisScored.map((x) => x.poi))
    }

    // Capacity per stop based on nights and max POIs per day
    const capacity = stop.nights * maxPerDay

    stop.pois = cityPoisScored
      .filter((x) => !used.has(x.poi.id))
      .slice(0, capacity)
      .map((x) => x.poi)

    stop.pois.forEach((p) => used.add(p.id))
  }

  // 5) Build transfers between consecutive stops
  const transfers = buildTransfers(stops)

  // 6) Build day-by-day plan
  const plan: ItineraryDay[] = []
  let dayCounter = 1

  for (const stop of stops) {
    for (let d = 0; d < stop.nights; d++) {
      const startIdx = d * maxPerDay
      const dayPois = stop.pois.slice(startIdx, startIdx + maxPerDay)

      plan.push({
        day: dayCounter++,
        baseCity: stop.city,
        pois: dayPois,
      })
    }
  }

  return { country, days, stops, transfers, plan }
}