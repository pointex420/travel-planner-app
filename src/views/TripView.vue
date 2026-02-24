<template>
  <section class="grid">
    <div class="card">
      <h1>Trip Generator</h1>
      <p class="sub">Create a multi-stop itinerary with POIs based on your preferences.</p>
      <TripForm />
    </div>

    <div class="card">
      <h2>Itinerary</h2>
      <ItineraryResult />
    </div>
  </section>
</template>

<script setup lang="ts">
import TripForm from '../components/TripForm.vue'
import ItineraryResult from '../components/ItineraryResult.vue'
</script>

<style scoped>
.grid { display:grid; grid-template-columns: 1fr; gap:16px; }
@media (min-width: 900px) { .grid { grid-template-columns: 1.2fr 0.8fr; } }
.card { border:1px solid #e6e6e6; border-radius:16px; padding:18px; }
.sub { margin-top:6px; color:#555; }
h1 { margin:0; }
h2 { margin:0 0 10px 0; }
</style> 