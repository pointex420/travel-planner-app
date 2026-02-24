<script setup lang="ts"></script>

<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <span class="title">Travel Planner</span>
      </div>

      <nav class="nav">
        <RouterLink to="/" class="link" active-class="active">Home</RouterLink>
        <RouterLink to="/trip" class="link" active-class="active">Trip</RouterLink>
      </nav>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app { min-height: 100vh; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
.header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #e6e6e6; }
.brand { display:flex; align-items:center; gap:10px; }
.logo { font-size: 20px; }
.title { font-weight: 700; }
.nav { display:flex; gap:14px; }
.link { text-decoration:none; padding:8px 10px; border-radius:10px; color:#111; }
.link:hover { background:#f3f3f3; }
.active { background:#111; color:#fff; }
.main { padding: 24px 20px; max-width: 980px; margin: 0 auto; }
</style>