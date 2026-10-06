<script setup>
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'
import { useKeepFocusedFieldVisible } from './composables/useKeepFocusedFieldVisible'

// En móvil, el teclado no tapa el campo activo de ningún formulario.
useKeepFocusedFieldVisible()
</script>

<template>
  <TheHeader />
  <main class="pt-16">
    <router-view />
  </main>
  <TheFooter />
</template>