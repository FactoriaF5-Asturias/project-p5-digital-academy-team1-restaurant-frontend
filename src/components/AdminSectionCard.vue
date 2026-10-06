<script setup>
// Responsabilidad: tarjeta de acceso a una sección del admin.
// Si la sección está disponible es un enlace; si no, se muestra como "Próximamente".

defineProps({
  section: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <router-link
    v-if="section.available"
    :to="{ name: section.routeName }"
    class="admin-section-card admin-section-card--link"
  >
    <span class="material-symbols-outlined admin-section-card__icon" aria-hidden="true">
      {{ section.icon }}
    </span>
    <span class="admin-section-card__title">{{ section.title }}</span>
    <span class="admin-section-card__description">{{ section.description }}</span>
    <span class="admin-section-card__action">Entrar →</span>
  </router-link>

  <div
    v-else
    class="admin-section-card admin-section-card--soon"
    aria-disabled="true"
  >
    <span class="material-symbols-outlined admin-section-card__icon" aria-hidden="true">
      {{ section.icon }}
    </span>
    <span class="admin-section-card__title">{{ section.title }}</span>
    <span class="admin-section-card__description">{{ section.description }}</span>
    <span class="admin-section-card__action">Próximamente</span>
  </div>
</template>

<style scoped>
@reference "../style.css";

.admin-section-card {
  @apply flex flex-col gap-1 rounded-xl border border-outline-variant bg-white p-5;
}

.admin-section-card--link {
  @apply no-underline transition hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary;
}

.admin-section-card--soon {
  @apply cursor-not-allowed opacity-60;
}

.admin-section-card__icon {
  @apply text-3xl text-primary;
}

.admin-section-card__title {
  @apply font-heading text-base font-semibold text-on-surface;
}

.admin-section-card__description {
  @apply text-sm text-on-surface-variant;
}

.admin-section-card__action {
  @apply mt-2 text-sm font-semibold text-primary;
}
</style>