<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { canAccess } from '../router/guards'
import UserMenu from './UserMenu.vue'
import UserIdentity from './UserIdentity.vue'
import logo from '../assets/logo.png'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const isMenuOpen = ref(false)

const navLinks = [
    { to: { name: 'carta' }, label: 'Carta' },
    { to: { name: 'mi-pedido' }, label: 'Mi pedido' },
    { to: { name: 'perfil' }, label: 'Perfil' },
    { to: { name: 'cesta' }, label: 'Cesta' },
    { to: { name: 'cocina' }, label: 'Cocina' },
    { to: { name: 'reparto' }, label: 'Reparto' },
    { to: { name: 'admin' }, label: 'Admin' },
  ]

// Los permisos se leen del router (meta.roles): una sola fuente de verdad.
const visibleLinks = computed(() =>
navLinks.filter((link) => canAccess(router.resolve(link.to), authStore.role))
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
  <header
    class="fixed top-0 left-0 z-50 w-full border-b border-[#C4C4C4] bg-[#E5E5E5]/95 shadow-sm backdrop-blur-xl"
  >
    <div class="mx-auto flex h-16 max-w-300 items-center justify-between gap-4 px-5">
      <div class="flex items-center gap-6">
        <router-link
          :to="{ name: 'carta' }"
          class="group flex items-center gap-2"
          @click="closeMenu"
        >
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-outline bg-surface shadow-sm transition-colors group-hover:border-primary"
          >
            <img
              :src="logo"
              alt="GitSushi"
              class="h-full w-full object-cover"
            />
          </div>

          <span
            class="font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary"
          >
            GitSushi
          </span>
        </router-link>

        <nav
          class="hidden items-center gap-1 rounded-lg border border-[#C4C4C4] bg-surface/70 p-1 shadow-sm xl:flex"
        >
          <router-link
            v-for="link in visibleLinks"
            :key="link.label"
            :to="link.to"
            class="nav-link flex items-center gap-1.5 rounded px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface/80 hover:text-on-surface"
            active-class="bg-surface text-primary font-semibold shadow-sm"
          >
            <span>{{ link.label }}</span>

            <span
              v-if="link.label === 'Cesta' && cartStore.itemCount > 0"
              class="rounded-full bg-[#f08069] px-1.5 py-0.5 text-[11px] font-bold text-white"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>
        </nav>
      </div>

      <div
        v-if="!authStore.isAuthenticated"
        class="hidden items-center gap-2 xl:flex"
      >
        <router-link
          :to="{ name: 'login' }"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          Iniciar sesión
        </router-link>

        <router-link
          :to="{ name: 'register' }"
          class="rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition hover:opacity-90"
        >
          Registrarse
        </router-link>
      </div>

      <div
        v-else
        class="hidden items-center gap-2 xl:flex"
      >
      <UserMenu
          :user="authStore.user"
          :role="authStore.role"
          @logout="handleLogout"
        />
      </div>

      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C4C4C4] bg-surface/70 xl:hidden"
        :aria-expanded="isMenuOpen"
        aria-label="Abrir menú de navegación"
        @click="toggleMenu"
      >
        <span class="text-lg leading-none">
          {{ isMenuOpen ? '✕' : '☰' }}
        </span>
      </button>
    </div>

    <nav
      v-if="isMenuOpen"
      class="flex flex-col gap-1 border-t border-[#C4C4C4] bg-surface px-5 py-3 xl:hidden"
    >
      <router-link
        v-for="link in visibleLinks"
        :key="link.label"
        :to="link.to"
        class="nav-link flex items-center gap-1.5 rounded px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
        active-class="bg-surface-variant text-primary font-semibold"
        @click="closeMenu"
      >
        <span>{{ link.label }}</span>

        <span
          v-if="link.label === 'Cesta' && cartStore.itemCount > 0"
          class="rounded-full bg-[#f08069] px-1.5 py-0.5 text-[11px] font-bold text-white"
        >
          {{ cartStore.itemCount }}
        </span>
      </router-link>

      <div
        v-if="!authStore.isAuthenticated"
        class="mt-2 flex flex-col gap-2 border-t border-[#C4C4C4] pt-3"
      >
        <router-link
          :to="{ name: 'login' }"
          class="rounded px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
          @click="closeMenu"
        >
          Iniciar sesión
        </router-link>

        <router-link
          :to="{ name: 'register' }"
          class="rounded bg-primary-container px-3 py-2 text-sm font-semibold text-on-primary-container transition hover:opacity-90"
          @click="closeMenu"
        >
          Registrarse
        </router-link>
      </div>

      <div
        v-else
        class="mt-2 flex flex-col gap-2 border-t border-[#C4C4C4] pt-3">
                <UserIdentity :user="authStore.user" :role="authStore.role" class="px-3 py-2" />

        <button
          type="button"
          class="rounded bg-primary-container px-3 py-2 text-left text-sm font-semibold text-on-primary-container transition hover:opacity-90"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  </header>
</template>