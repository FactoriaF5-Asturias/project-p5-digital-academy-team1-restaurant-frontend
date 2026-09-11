<script setup>
import { useCartStore } from '../stores/cart'
import logo from '../assets/logo.png'

const cartStore = useCartStore()

const navLinks = [
  { to: { name: 'carta' }, label: 'Carta' },
  { to: { name: 'mi-pedido' }, label: 'Mi pedido' },
  { to: { name: 'perfil' }, label: 'Perfil' },
  { to: { name: 'cesta' }, label: 'Cesta' },
  { to: { name: 'cocina' }, label: 'Cocina' },
  { to: { name: 'reparto' }, label: 'Reparto' },
  { to: { name: 'admin' }, label: 'Admin' },
]
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-50 bg-[#E5E5E5]/95 backdrop-blur-xl border-b border-[#C4C4C4] shadow-sm">
    <div class="h-16 max-w-[1200px] mx-auto px-5 flex items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <router-link :to="{ name: 'carta' }" class="flex items-center gap-2 group">
            <div class="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-outline group-hover:border-primary shadow-sm transition-colors overflow-hidden">
            <img :src="logo" alt="GitSushi" class="w-full h-full object-cover" />
          </div>
          <span class="text-on-surface tracking-tight font-bold group-hover:text-primary transition-colors">GitSushi</span>
        </router-link>

        <nav class="hidden xl:flex items-center gap-1 bg-surface/70 p-1 rounded-lg border border-[#C4C4C4] shadow-sm">
          <router-link
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="px-3 py-1.5 rounded text-on-surface-variant text-sm hover:text-on-surface hover:bg-surface/80 transition-colors flex items-center gap-1.5"
            active-class="bg-surface text-primary font-semibold shadow-sm"
          >
            <span>{{ link.label }}</span>
            <span
              v-if="link.label === 'Cesta' && cartStore.itemCount > 0"
              class="px-1.5 py-0.5 rounded-full bg-[#f08069] text-white text-[11px] font-bold"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>