import type { LatLng } from './geo'
import type { Interest } from './preferences'

export type Poi = {
  id: string
  name: string
  city: string
  country: string
  location: LatLng
  tags: Interest[]
  popularity: number // 0..100
  durationMin: number
}