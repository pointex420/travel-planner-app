import type { Preferences } from '../../types/preferences.ts'
import type { TripTuning } from '../../types/tuning.ts'

export function deriveTuning(prefs: Preferences, days: number): TripTuning {
  // Base mapping: user intent -> internal parameters
  let maxPoisPerDay = 3
  let minNightsPerStop = 2
  let maxStops = 5

  if (prefs.pace === 'relaxed') {
    maxPoisPerDay = 2
    minNightsPerStop = 3
    maxStops = 4
  } else if (prefs.pace === 'fast') {
    maxPoisPerDay = 4
    minNightsPerStop = 1
    maxStops = 6
  }

  // Clamp maxStops depending on trip length
  // You can't have more stops than days, and for very short trips you also want fewer stops.
  maxStops = Math.min(maxStops, Math.max(1, days)) // stops <= days

  if (days <= 5) maxStops = Math.min(maxStops, 2)
  else if (days <= 10) maxStops = Math.min(maxStops, 3)
  else if (days <= 14) maxStops = Math.min(maxStops, 4)
  // >14 keeps the pace-defined maxStops (up to 6)

  return { maxPoisPerDay, minNightsPerStop, maxStops }
}

// to-do create a better algorithem where the output makes sense