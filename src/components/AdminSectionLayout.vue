<script setup>
// Responsabilidad: marco común de cada sección del admin.
// Muestra la ruta de migas y el enlace para volver al inicio del panel,
// y pinta dentro (slot) el contenido de la sección.

defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="admin-section">
    <nav class="admin-section__breadcrumb" aria-label="Ruta de navegación">
      <router-link :to="{ name: 'admin' }" class="admin-section__breadcrumb-link">Admin</router-link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{{ title }}</span>
    </nav>

    <router-link :to="{ name: 'admin' }" class="admin-section__back">
      <span aria-hidden="true">←</span> Volver al panel
    </router-link>

    <slot />
  </div>
</template>

<style scoped>
@reference "../style.css";

.admin-section {
  @apply flex flex-col gap-3;
}

.admin-section__breadcrumb {
  @apply flex items-center gap-2 text-sm text-on-surface-variant;
}

.admin-section__breadcrumb-link {
  @apply hover:text-primary hover:underline;
}

/* 44px de alto: tamaño mínimo cómodo para el tacto */
.admin-section__back {
  @apply inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-primary hover:underline;
}
</style>