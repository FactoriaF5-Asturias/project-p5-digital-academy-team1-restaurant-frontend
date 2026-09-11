vue
<script setup>
import TheHeader from './components/TheHeader.vue'
</script>

<template>
  <TheHeader />
  <main class="pt-16">
    <router-view />
  </main>
</template>
