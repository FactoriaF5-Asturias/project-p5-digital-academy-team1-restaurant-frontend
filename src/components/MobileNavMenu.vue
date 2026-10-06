<script setup>
import NavLinks from './NavLinks.vue'
import UserIdentity from './UserIdentity.vue'
import { MOBILE_NAV_ID, NAV_VARIANTS } from '../constants/navigation'

// Responsabilidad: menú desplegable para móvil y tablet con los enlaces
// del rol y las acciones de sesión (entrar, registrarse o cerrar sesión).

defineProps({
  links: {
    type: Array,
    required: true,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
  user: {
    type: Object,
    default: null,
  },
  role: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['navigate', 'logout'])

function handleNavigate() {
  emit('navigate')
}

function handleLogout() {
  emit('logout')
}
</script>

<template>
  <nav :id="MOBILE_NAV_ID" class="mobile-nav">
    <NavLinks
      :links="links"
      :cart-count="cartCount"
      :variant="NAV_VARIANTS.MOBILE"
      @navigate="handleNavigate"
    />

    <div v-if="!user" class="mobile-nav__section">
      <router-link
        :to="{ name: 'login' }"
        class="mobile-nav__action"
        @click="handleNavigate"
      >
        Iniciar sesión
      </router-link>

      <router-link
        :to="{ name: 'register' }"
        class="mobile-nav__action mobile-nav__action--primary"
        @click="handleNavigate"
      >
        Registrarse
      </router-link>
    </div>

    <div v-else class="mobile-nav__section">
      <UserIdentity :user="user" :role="role" class="mobile-nav__identity" />

      <button
        type="button"
        class="mobile-nav__action mobile-nav__action--primary"
        @click="handleLogout"
      >
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>

<style scoped>
@reference "../style.css";

/* El alto máximo descuenta el header (4rem) y hace scroll si hay muchos enlaces */
.mobile-nav {
  @apply flex max-h-[calc(100svh-4rem)] flex-col gap-1 overflow-y-auto border-t border-[#C4C4C4] bg-surface px-5 py-3 xl:hidden;
}

.mobile-nav__section {
  @apply mt-2 flex flex-col gap-2 border-t border-[#C4C4C4] pt-3;
}

.mobile-nav__identity {
  @apply px-3 py-2;
}

/* 44px de alto: tamaño mínimo cómodo para el tacto */
.mobile-nav__action {
  @apply flex min-h-11 items-center rounded px-3 text-left text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary;
}

.mobile-nav__action--primary {
  @apply bg-primary-container text-on-primary-container hover:opacity-90 hover:text-on-primary-container;
}
</style>