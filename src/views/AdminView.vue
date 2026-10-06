<script setup>
// Responsabilidad: contenedor del panel de administración.
// Pinta el inicio o la sección elegida según la ruta hija (/admin, /admin/productos...).
</script>

<template>
  <main class="admin-view">
    <router-view />
  </main>
</template>

<style scoped>
@reference "../style.css";

.admin-view {
  @apply mx-auto max-w-[1200px] px-5 py-8;
}
</style>