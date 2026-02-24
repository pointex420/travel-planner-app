export type Interest =
  | 'nature'
  | 'culture'
  | 'food'
  | 'history'
  | 'nightlife'
  | 'adventure'
  | 'relax'

export type Preferences = {
  interests: Interest[]
  pace: 'relaxed' | 'balanced' | 'fast'
  maxPoisPerDay: number
}