<script setup>
import ExclusiveOffersCard from "../components/ExclusiveOffersCard.vue";
</script>

<template>
  <main class="perfil-view">
    <h1 class="perfil-view__title">Mi Perfil</h1>

    <ExclusiveOffersCard />
  </main>
</template>

<style scoped>
@reference "../style.css";

.perfil-view {
  @apply flex flex-col gap-6 max-w-3xl mx-auto px-4 sm:px-6 py-8;
}

.perfil-view__title {
  @apply text-2xl font-heading;
}
</style>
