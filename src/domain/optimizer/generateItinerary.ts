import type { TripRequest } from '../../types/trip'
import type { Itinerary, ItineraryDay, Stop } from '../../types/itinerary'
import type { Poi } from '../../types/poi'
import type { Transfer } from '../../types/transfer'
import { scorePoi } from '../../domain/scoring/scorePoi'
import { distanceKm, estimateDurationMin } from '../../services/route/FakeRouteService'
import { deriveTuning } from '../../domain/optimizer/deriveTuning'

type ScoredPoi = { poi: Poi; score: number }

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function cityKey(p: Poi): string {
  return `${p.country}::${p.city}`.toLowerCase()
}

function cityNameFromKey(key: string): { country: string; city: string } {
  const [country, city] = key.split('::')
  return { country, city }
}

function cityLocation(pois: Poi[]): { lat: number; lng: number } {
  const first = pois[0]
  return { lat: first.location.lat, lng: first.location.lng }
}

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
      if (b[1].totalScore !== a[1].totalScore) return b[1].totalScore - a[1].totalScore
      return b[1].count - a[1].count
    })
    .slice(0, Math.max(1, maxStops))
    .map(([key]) => key)
}

/**
 * Distribute days into stops while respecting a minimum nights per stop.
 * Example: days=10, stops=3, minNights=3 => [4,3,3]
 */
function distributeDaysIntoStops(
  stopKeys: string[],
  totalDays: number,
  minNightsPerStop: number
): Stop[] {
  const nStops = Math.max(1, stopKeys.length)

  // Ensure we can satisfy min nights per stop.
  // If not enough days, reduce number of stops until it fits.
  let effectiveStops = nStops
  while (effectiveStops > 1 && effectiveStops * minNightsPerStop > totalDays) {
    effectiveStops -= 1
  }

  const keys = stopKeys.slice(0, effectiveStops)

  // Start by giving each stop the minimum
  const nights = new Array(keys.length).fill(minNightsPerStop)
  let remaining = totalDays - keys.length * minNightsPerStop

  // Distribute remaining nights round-robin
  let idx = 0
  while (remaining > 0) {
    nights[idx] += 1
    remaining -= 1
    idx = (idx + 1) % nights.length
  }

  return keys.map((key, i) => {
    const { country, city } = cityNameFromKey(key)
    return {
      city,
      country,
      location: { lat: 0, lng: 0 }, // filled later
      nights: nights[i],
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

  // 0) derive internal tuning from pace + days
  const tuning = deriveTuning(preferences, days)
  const maxPerDay = tuning.maxPoisPerDay

  // 1) Score POIs
  const scored: ScoredPoi[] = pois
    .map((p) => ({ poi: p, score: scorePoi(p, preferences) }))
    .sort((a, b) => b.score - a.score)

  // 2) Choose stop cities based on best matching POIs (pace controls maxStops)
  const stopKeys = pickTopCities(scored, tuning.maxStops)
  const safeStopKeys = stopKeys.length ? stopKeys : unique(pois.map(cityKey)).slice(0, 2)

  // 3) Distribute days into nights per stop (pace controls minNightsPerStop)
  const stops = distributeDaysIntoStops(safeStopKeys, days, tuning.minNightsPerStop)

  // 4) Attach city location + pick POIs per stop
  const used = new Set<string>()

  for (const stop of stops) {
    const key = `${stop.country}::${stop.city}`.toLowerCase()
    const cityPoisScored = scored.filter((x) => cityKey(x.poi) === key)

    if (cityPoisScored.length > 0) {
      stop.location = cityLocation(cityPoisScored.map((x) => x.poi))
    }

    const capacity = stop.nights * maxPerDay

    stop.pois = cityPoisScored
      .filter((x) => !used.has(x.poi.id))
      .slice(0, capacity)
      .map((x) => x.poi)

    stop.pois.forEach((p) => used.add(p.id))
  }

  // 5) Transfers between stops
  const transfers = buildTransfers(stops)

  // 6) Day plan
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