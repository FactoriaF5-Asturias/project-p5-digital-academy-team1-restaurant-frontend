<script setup>
import { computed } from "vue";
import ExclusiveOffersCard from "../components/ExclusiveOffersCard.vue";
import ProfileForm from "../components/profile/ProfileForm.vue";
import { useAuthStore } from "../stores/auth";
import { ROLES } from "../constants/roles";

const authStore = useAuthStore();

// Las ofertas exclusivas son solo para clientes: admin, cocina y reparto no hacen pedidos.
const canSeeOffers = computed(() => authStore.role === ROLES.CUSTOMER);
</script>

<template>
  <main class="perfil-view">
    <h1 class="perfil-view__title">Mi Perfil</h1>

    <ProfileForm />

    <ExclusiveOffersCard v-if="canSeeOffers" />
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