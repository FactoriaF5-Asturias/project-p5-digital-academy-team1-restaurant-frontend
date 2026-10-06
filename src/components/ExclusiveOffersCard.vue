<script setup>
import { onMounted, ref } from 'vue'
import { useExclusiveOffersStore } from '../stores/exclusiveOffers'
import LoadingSpinner from './LoadingSpinner.vue'

const offersStore = useExclusiveOffersStore()
const copiedOfferId = ref(null)

onMounted(() => {
  offersStore.fetchOffers()
})

async function handleCopyCoupon(offer) {
  try {
    await navigator.clipboard.writeText(offer.coupon)
    copiedOfferId.value = offer.id
    setTimeout(() => {
      if (copiedOfferId.value === offer.id) {
        copiedOfferId.value = null
      }
    }, 2000)
  } catch (err) {
    console.error('[ExclusiveOffersCard] Error al copiar el cupón:', err)
  }
}
</script>

<template>
  <section class="exclusive-offers" aria-label="Ofertas exclusivas desbloqueadas">
    <h2 class="exclusive-offers__title">Ofertas Exclusivas Desbloqueadas</h2>

    <LoadingSpinner v-if="offersStore.isLoading" label="Cargando tus ofertas..." />
    <p v-else-if="offersStore.error" class="exclusive-offers__status exclusive-offers__status--error">
      {{ offersStore.error }}
    </p>

    <template v-else>
      <p v-if="offersStore.activeOffers.length === 0" class="exclusive-offers__status">
        Todavía no tienes ofertas exclusivas desbloqueadas.
      </p>

      <ul v-else class="exclusive-offers__list">
        <li v-for="offer in offersStore.activeOffers" :key="offer.id" class="exclusive-offers__card">
          <div class="exclusive-offers__info">
            <p class="exclusive-offers__product">{{ offer.product.name }}</p>
            <p class="exclusive-offers__discount">{{ offer.discountRate }}% de descuento</p>
          </div>

          <button
            v-if="offer.coupon"
            type="button"
            class="exclusive-offers__copy-btn"
            @click="handleCopyCoupon(offer)"
          >
            {{ copiedOfferId === offer.id ? '¡Copiado!' : `Copiar ${offer.coupon}` }}
          </button>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
@reference "../style.css";

.exclusive-offers {
  @apply flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface p-4;
}

.exclusive-offers__title {
  @apply font-heading text-lg font-semibold text-on-surface;
}

.exclusive-offers__status {
  @apply text-center text-on-surface-variant py-6;
}

.exclusive-offers__status--error {
  @apply text-error;
}

.exclusive-offers__list {
  @apply flex flex-col gap-3;
}

.exclusive-offers__card {
  @apply flex items-center justify-between gap-3 rounded-lg border border-outline-variant p-3;
}

.exclusive-offers__product {
  @apply font-medium text-on-surface;
}

.exclusive-offers__discount {
  @apply text-sm font-semibold text-primary;
}

.exclusive-offers__copy-btn {
  @apply shrink-0 rounded-full border border-outline-variant px-4 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-primary-container;
}
</style>