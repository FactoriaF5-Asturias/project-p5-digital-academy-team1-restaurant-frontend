<script setup>
import { ADMIN_SECTIONS } from '../../constants/adminSections'
import AdminSectionCard from '../../components/AdminSectionCard.vue'
import CloudAutomationStatusCard from '../../components/CloudAutomationStatusCard.vue'

// Responsabilidad: inicio del panel de administración con una tarjeta por sección.
</script>

<template>
  <section class="admin-home" aria-labelledby="admin-home-title">
    <h1 id="admin-home-title" class="admin-home__title">Panel de administración</h1>
    <p class="admin-home__subtitle">Elige qué quieres gestionar.</p>

    <CloudAutomationStatusCard class="admin-home__status" />

    <ul class="admin-home__grid">
      <li v-for="section in ADMIN_SECTIONS" :key="section.key" class="admin-home__item">
        <AdminSectionCard :section="section" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
@reference "../../style.css";

.admin-home__title {
  @apply font-heading text-2xl font-bold text-on-surface;
}

.admin-home__subtitle {
  @apply mb-6 text-on-surface-variant;
}

.admin-home__status {
  @apply mb-6;
}

.admin-home__grid {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4;
}

.admin-home__item {
  @apply flex;
}

.admin-home__item > * {
  @apply w-full;
}
</style>
