<script setup>
import { NAV_VARIANTS } from '../constants/navigation'

// Responsabilidad: pintar la lista de enlaces de navegación (escritorio o móvil)
// y el contador de la cesta en el enlace que lo indique.

defineProps({
  links: {
    type: Array,
    required: true,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
  variant: {
    type: String,
    default: NAV_VARIANTS.DESKTOP,
    validator: (value) => Object.values(NAV_VARIANTS).includes(value),
  },
})

const emit = defineEmits(['navigate'])

function handleNavigate() {
  emit('navigate')
}
</script>

<template>
  <router-link
    v-for="link in links"
    :key="link.label"
    :to="link.to"
    class="nav-links__link"
    :class="`nav-links__link--${variant}`"
    :active-class="`nav-links__link--active-${variant}`"
    @click="handleNavigate"
  >
    <span>{{ link.label }}</span>

    <span
      v-if="link.showsCartCount && cartCount > 0"
      class="nav-links__badge"
    >
      {{ cartCount }}
    </span>
  </router-link>
</template>

<style scoped>
@reference "../style.css";

.nav-links__link {
  @apply flex items-center gap-1.5 rounded px-3 text-sm text-on-surface-variant transition-colors hover:text-on-surface;
}

.nav-links__link--desktop {
  @apply py-1.5 hover:bg-surface/80;
}

/* 44px de alto: tamaño mínimo cómodo para el tacto */
.nav-links__link--mobile {
  @apply min-h-11 hover:bg-surface-variant;
}

.nav-links__link--active-desktop {
  @apply bg-surface font-semibold text-primary shadow-sm;
}

.nav-links__link--active-mobile {
  @apply bg-surface-variant font-semibold text-primary;
}

.nav-links__badge {
  @apply rounded-full bg-[#f08069] px-1.5 py-0.5 text-[11px] font-bold text-white;
}
</style>