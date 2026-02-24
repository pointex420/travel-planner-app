<template>
  <section class="card">
    <h1>Welcome</h1>
    <p>
      This project is a learning-driven Vue app that will evolve into a fast and smart travel route calculator.
    </p>
    <RouterLink to="/trip" class="cta">plan your trip</RouterLink>
  </section>
</template>

<style scoped>
.card { border:1px solid #e6e6e6; border-radius:16px; padding:18px; }
.cta { display:inline-block; margin-top:10px; text-decoration:none; padding:10px 12px; border-radius:12px; background:#111; color:#fff; }
</style>