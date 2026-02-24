import type { Poi } from '../../types/poi'
import type { Preferences } from '../../types/preferences'

/**
 * Returns a score where higher means "better match" for the user.
 */
export function scorePoi(poi: Poi, prefs: Preferences): number {
  // 1) Base signal: popularity
  // We scale popularity (0..100) into a smaller influence.
  let score = poi.popularity * 0.6

  // 2) Interest matching: the strongest signal
  // Each matching tag gets a strong bonus.
  const matches = poi.tags.filter((t) => prefs.interests.includes(t)).length
  score += matches * 30

  // 3) Pace adjustment: how long the POI takes matters depending on pace
  // Relaxed: dislikes very long activities a bit (too exhausting)
  if (prefs.pace === 'relaxed') {
    score -= Math.max(0, poi.durationMin - 150) * 0.08
  }

  // Fast: slightly prefers shorter activities (can pack more in)
  if (prefs.pace === 'fast') {
    score += Math.max(0, 150 - poi.durationMin) * 0.06
  }

  // Balanced: no duration preference

  return Math.round(score)
}