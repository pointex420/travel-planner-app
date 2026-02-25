import { defineStore } from 'pinia'
import type { Itinerary } from '../types/itinerary'
import type { Interest, Preferences } from '../types/preferences'
import { fetchPoisByCountry } from '../services/poi/FakePoiService'
import { generateItinerary } from '../domain/optimizer/generateItinerary'

type FieldErrors = { country?: string; days?: string, interests?: string}

const initialPreferences: Preferences = {
  interests: [] as Interest[],
  pace: 'balanced',
  maxPoisPerDay: 3,
}

export const useTripStore = defineStore('trip', {
  state: () => ({
    country: '',
    days: 0,
    preferences: { ...initialPreferences },

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
      if (this.preferences.interests.length === 0) {
        errors.interests = 'Please select at least one interest.'
      }

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
      
      if (this.preferences.pace === 'relaxed') {
        this.preferences.maxPoisPerDay = 2
      } else if (this.preferences.pace === 'balanced') {
        this.preferences.maxPoisPerDay = 3
      } else {
        this.preferences.maxPoisPerDay = 4
      }

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