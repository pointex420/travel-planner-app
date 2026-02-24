import type { Preferences } from './preferences'

export type TripRequest = {
  country: string
  days: number
  preferences: Preferences
}