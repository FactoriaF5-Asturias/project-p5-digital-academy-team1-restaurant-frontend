<script setup>
import { onMounted, ref } from 'vue'
import { useExclusiveOffersStore } from '../stores/exclusiveOffers'

const offersStore = useExclusiveOffersStore()
const copiedOfferId = ref(null)

onMounted(() => {
  offersStore.fetchOffers()
})

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

async function handleCopyCoupon(offer) {
  try {
    await navigator.clipboard.writeText(offer.couponCode)
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

    <p v-if="offersStore.isLoading" class="exclusive-offers__status">Cargando tus ofertas...</p>
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
            <p class="exclusive-offers__product">{{ offer.productName }}</p>
            <p class="exclusive-offers__discount">{{ offer.discountPercentage }}% de descuento</p>
            <p v-if="offer.expiresAt" class="exclusive-offers__expiry">
              Válida hasta el {{ formatDate(offer.expiresAt) }}
            </p>
          </div>

          <button
            v-if="offer.couponCode"
            type="button"
            class="exclusive-offers__copy-btn"
            @click="handleCopyCoupon(offer)"
          >
            {{ copiedOfferId === offer.id ? '¡Copiado!' : `Copiar ${offer.couponCode}` }}
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

.exclusive-offers__expiry {
  @apply text-sm text-on-surface-variant;
}

.exclusive-offers__copy-btn {
  @apply shrink-0 rounded-full border border-outline-variant px-4 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-primary-container;
}
</style>
