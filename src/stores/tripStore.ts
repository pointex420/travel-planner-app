import { defineStore } from 'pinia'
import type { Itinerary } from '../types/itinerary'
import type { Interest, Preferences } from '../types/preferences'
import { fetchPoisByCountry } from '../services/poi/FakePoiService'
import { generateItinerary } from '../domain/optimizer/generateItinerary'

type FieldErrors = { country?: string; days?: string }

const defaultPrefs: Preferences = {
  interests: ['nature', 'culture'],
  pace: 'balanced',
  maxPoisPerDay: 3,
}

export const useTripStore = defineStore('trip', {
  state: () => ({
    country: 'Colombia',
    days: 10,
    preferences: { ...defaultPrefs },

    itinerary: null as Itinerary | null,
    loading: false,
    error: null as string | null,

    touched: false,
    fieldErrors: {} as FieldErrors,
  }),

  actions: {
    validate(): boolean {
      const errors: FieldErrors = {}
      const c = this.country.trim()
      const d = Number(this.days)

      if (c.length < 2) errors.country = 'Please enter a country name.'
      if (!Number.isFinite(d) || d < 3) errors.days = 'Please enter at least 3 days.'
      if (d > 30) errors.days = 'Please keep trips under 30 days for now.'

      this.fieldErrors = errors
      return Object.keys(errors).length === 0
    },

    toggleInterest(i: Interest) {
      const set = new Set(this.preferences.interests)
      set.has(i) ? set.delete(i) : set.add(i)
      this.preferences.interests = Array.from(set)
    },

    async generate() {
      this.touched = true
      this.error = null
      this.itinerary = null

      if (!this.validate()) return

      try {
        this.loading = true
        const pois = await fetchPoisByCountry(this.country)

        if (pois.length === 0) {
          this.error = 'No POIs found for this country (demo dataset). Try "Colombia" or "Brazil".'
          return
        }

        this.itinerary = generateItinerary(
          { country: this.country.trim(), days: Number(this.days), preferences: this.preferences },
          pois
        )
      } catch (e: any) {
        this.error = e?.message ?? 'Something went wrong.'
      } finally {
        this.loading = false
      }
    },
  },
})