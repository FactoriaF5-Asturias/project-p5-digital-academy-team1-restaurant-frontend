<script setup>
import CartSummary from "../components/CartSummary.vue";
import ChannelSelector from "../components/ChannelSelector.vue";
import ChefNoteField from '../components/ChefNoteField.vue'
</script>

<template>
  <main class="cesta-view">
    <h1 class="cesta-view__title">Tu cesta</h1>

    <div class="cesta-view__content">
      <CartSummary />
      <ChannelSelector />
      <ChefNoteField />
    </div>
  </main>
</template>

<style scoped>
@reference "../style.css";

.cesta-view {
  @apply max-w-3xl mx-auto px-4 sm:px-6 py-8;
}

.cesta-view__title {
  @apply text-2xl font-heading mb-6;

}

.cesta-view__content {
  @apply flex flex-col gap-6;
}
</style>
