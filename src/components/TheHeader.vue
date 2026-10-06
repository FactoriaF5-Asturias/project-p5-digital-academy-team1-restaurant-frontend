<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { canAccess } from '../router/guards'
import { getRoleLabel } from '../constants/roles'
import { MOBILE_NAV_ID, NAV_LINKS } from '../constants/navigation'
import NavLinks from './NavLinks.vue'
import MobileNavMenu from './MobileNavMenu.vue'
import UserMenu from './UserMenu.vue'
import logo from '../assets/logo.png'

// Responsabilidad: coordinar la cabecera. Decide qué enlaces ve cada rol,
// abre y cierra el menú móvil y gestiona el cierre de sesión.
// El pintado de enlaces y del menú móvil está en NavLinks y MobileNavMenu.

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const isMenuOpen = ref(false)

const roleLabel = computed(() => getRoleLabel(authStore.role))

// Los permisos se leen del router (meta.roles): una sola fuente de verdad.
const visibleLinks = computed(() =>
  NAV_LINKS.filter((link) => canAccess(router.resolve(link.to), authStore.role))
)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  closeMenu()
  await router.push({ name: 'carta' })
}
</script>

<template>
  <header class="the-header">
    <div class="the-header__bar">
      <div class="the-header__start">
        <router-link
          :to="{ name: 'carta' }"
          class="the-header__brand group"
          @click="closeMenu"
        >
          <div class="the-header__logo">
            <img :src="logo" alt="GitSushi" class="the-header__logo-image" />
          </div>

          <span class="the-header__brand-name">GitSushi</span>
        </router-link>

        <nav class="the-header__desktop-nav">
          <NavLinks :links="visibleLinks" :cart-count="cartStore.itemCount" />
        </nav>
      </div>

      <div v-if="!authStore.isAuthenticated" class="the-header__auth">
        <router-link :to="{ name: 'login' }" class="the-header__login">
          Iniciar sesión
        </router-link>

        <router-link :to="{ name: 'register' }" class="the-header__register">
          Registrarse
        </router-link>
      </div>

      <div v-else class="the-header__auth">
        <span v-if="roleLabel" class="the-header__role">{{ roleLabel }}</span>

        <UserMenu
          :user="authStore.user"
          :role="authStore.role"
          @logout="handleLogout"
        />
      </div>

      <button
        type="button"
        class="the-header__menu-toggle"
        :aria-expanded="isMenuOpen"
        :aria-controls="MOBILE_NAV_ID"
        aria-label="Menú de navegación"
        @click="toggleMenu"
      >
        <span class="the-header__menu-icon">
          {{ isMenuOpen ? '✕' : '☰' }}
        </span>
      </button>
    </div>

    <MobileNavMenu
      v-if="isMenuOpen"
      :links="visibleLinks"
      :cart-count="cartStore.itemCount"
      :user="authStore.user"
      :role="authStore.role"
      @navigate="closeMenu"
      @logout="handleLogout"
    />
  </header>
</template>

<style scoped>
@reference "../style.css";

.the-header {
  @apply fixed top-0 left-0 z-50 w-full border-b border-[#C4C4C4] bg-[#E5E5E5]/95 shadow-sm backdrop-blur-xl;
}

.the-header__bar {
  @apply mx-auto flex h-16 max-w-300 items-center justify-between gap-4 px-5;
}

.the-header__start {
  @apply flex items-center gap-6;
}

.the-header__brand {
  @apply flex items-center gap-2;
}

.the-header__logo {
  @apply flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-outline bg-surface shadow-sm transition-colors group-hover:border-primary;
}

.the-header__logo-image {
  @apply h-full w-full object-cover;
}

.the-header__brand-name {
  @apply font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary;
}

/* Escritorio (xl): menú horizontal. Por debajo se usa el menú móvil. */
.the-header__desktop-nav {
  @apply hidden items-center gap-1 rounded-lg border border-[#C4C4C4] bg-surface/70 p-1 shadow-sm xl:flex;
}

.the-header__auth {
  @apply hidden items-center gap-2 xl:flex;
}

.the-header__role {
  @apply rounded-full border border-[#C4C4C4] bg-white px-3 py-1 text-sm font-medium text-on-surface;
}

.the-header__login {
  @apply rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary;
}

.the-header__register {
  @apply rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition hover:opacity-90;
}

/* 44x44px: tamaño mínimo cómodo para el tacto */
.the-header__menu-toggle {
  @apply flex h-11 w-11 items-center justify-center rounded-lg border border-[#C4C4C4] bg-surface/70 xl:hidden;
}

.the-header__menu-icon {
  @apply text-lg leading-none;
}
</style>