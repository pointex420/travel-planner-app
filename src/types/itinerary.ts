import type { LatLng } from './geo'
import type { Poi } from './poi'
import type { Transfer } from './transfer'

export type Stop = {
  city: string
  country: string
  location: LatLng
  nights: number
  pois: Poi[]
}

export type ItineraryDay = {
  day: number
  baseCity: string
  pois: Poi[]
}

export type Itinerary = {
  country: string
  days: number
  stops: Stop[]
  transfers: Transfer[]
  plan: ItineraryDay[]
}