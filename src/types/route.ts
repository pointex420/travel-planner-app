export type RouteRequest = {
  from: string
  to: string
}

export type RouteResult = {
  distanceKm: number
  durationMin: number
  provider: 'fake' | 'openrouteservice'
}