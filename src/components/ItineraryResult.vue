<script setup lang="ts">
    import { useTripStore } from '../stores/tripStore'
    const store = useTripStore()
</script>

<template>
  <div class="box">

    <div v-if="store.loading">
      Loading...
    </div>

    <div v-else-if="store.itinerary">

      <h3>Stops</h3>
      <ul>
        <li v-for="s in store.itinerary.stops" :key="s.city">
          {{ s.city }} ({{ s.nights }} nights)
        </li>
      </ul>

      <h3>Transfers</h3>
      <ul class="list">
        <li
          v-for="t in store.itinerary.transfers"
          :key="t.fromCity + '->' + t.toCity"
          class="item"
        >
          <strong>{{ t.fromCity }} → {{ t.toCity }}</strong>
          <span> </span>
          <span class="muted">
            {{ t.distanceKm }} km • {{ t.durationMin }} min
          </span>
        </li>
      </ul>

    </div>

    <div v-else>
      No itinerary yet.
    </div>

  </div>
</template>
