<script setup lang="ts">
  import { useTripStore } from '../stores/tripStore'
  import type { Interest } from '../types/preferences'
  import { computed } from 'vue'
  const store = useTripStore()

  const interests: Interest[] = ['nature','culture','food','history','nightlife','adventure','relax']
  const canGenerate = computed(() =>
    store.country.trim().length > 1 &&
    store.days >= 3 &&
    store.preferences.interests.length > 0
  )
</script>

<template>
  <form class="form" @submit.prevent="store.generate">
    <div class="row">
      <label class="label" for="country">Country</label>
      <input
        id="country"
        class="input"
        :class="{ invalid: store.touched && !!store.fieldErrors.country }"
        v-model="store.country"
        placeholder='Country you want to go'
        autocomplete="off"
      />
      <p v-if="store.touched && store.fieldErrors.country" class="hint error">{{ store.fieldErrors.country }}</p>
    </div>

    <div class="row">
      <label class="label" for="days">Days</label>
      <input
        id="days"
        class="input"
        :class="{ invalid: store.touched && !!store.fieldErrors.days }"
        type="number"
        min="3"
        max="30"
        v-model.number="store.days"
      />
      <p v-if="store.touched && store.fieldErrors.days" class="hint error">{{ store.fieldErrors.days }}</p>
    </div>

    <div class="row">
      <span class="label">Pace</span>
      <div class="segmented">
        <button type="button" class="seg" :class="{ on: store.preferences.pace==='relaxed' }" @click="store.preferences.pace='relaxed'">Relaxed</button>
        <button type="button" class="seg" :class="{ on: store.preferences.pace==='balanced' }" @click="store.preferences.pace='balanced'">Balanced</button>
        <button type="button" class="seg" :class="{ on: store.preferences.pace==='fast' }" @click="store.preferences.pace='fast'">Fast</button>
      </div>
    </div>

    <div class="row">
      <span class="label">Interests</span>
      <div class="chips">
        <button v-for="i in interests" :key="i" type="button" class="chip"
          :class="{ on: store.preferences.interests.includes(i) }"
          @click="store.toggleInterest(i)">
          {{ i }}
        </button>
      </div>
      <p class="hint">Select what you enjoy — the itinerary will prioritize matching POIs.</p>
    </div>

    <div class="actions">
      <button :disabled="!canGenerate || store.loading" class="btn primary" type="submit">
        <span v-if="store.loading" class="spinner"></span>
        {{ store.loading ? 'Generating…' : 'Generate trip' }}
      </button>
    </div>

    <p v-if="store.error" class="hint error">{{ store.error }}</p>
  </form>
</template>

<style scoped>
.form { display:flex; flex-direction:column; gap:14px; margin-top:14px; }
.row { display:flex; flex-direction:column; gap:6px; }
.label { font-weight:600; }
.input { padding:10px 12px; border-radius:12px; border:1px solid #d9d9d9; outline:none; }
.input:focus { border-color:#111; }
.invalid { border-color:#c62828; }
.hint { margin:0; font-size:13px; color:#555; }
.hint.error { color:#c62828; }

.actions { display:flex; gap:10px; margin-top:6px; }
.btn { padding:10px 12px; border-radius:12px; border:1px solid #d9d9d9; background:#fff; cursor:pointer; }
.primary { background:#111; color:#fff; border-color:#111; }
.btn:disabled { opacity:.6; cursor:not-allowed; }

.segmented { display:flex; border:1px solid #e6e6e6; border-radius:12px; overflow:hidden; width: fit-content; }
.seg { padding:8px 10px; border:0; background:#fff; cursor:pointer; }
.seg.on { background:#111; color:#fff; }

.chips { display:flex; flex-wrap:wrap; gap:8px; }
.chip { padding:8px 10px; border-radius:999px; border:1px solid #d9d9d9; background:#fff; cursor:pointer; }
.chip.on { background:#111; color:#fff; border-color:#111; }

.spinner {
  width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: rgba(255,255,255,1);
  display:inline-block; margin-right:8px; vertical-align:-2px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>