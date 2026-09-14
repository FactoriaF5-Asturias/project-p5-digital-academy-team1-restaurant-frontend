<script setup>
import heroImage from '../assets/hero.jfif'

function scrollToCarta() {
  document.getElementById('productos-carta')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="bg-surface-variant border-b border-outline">
        <div class="max-w-[1200px] mx-auto px-5 pt-8 pb-[4.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <!-- Texto -->
            <div class="flex flex-col gap-4 order-2 md:order-1">
        <span class="self-start bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Programmed to perfection
        </span>

        <h1 class="text-4xl sm:text-5xl font-heading font-extrabold text-on-surface leading-tight">
          Sushi con la precisión<br />
          <span class="text-primary">de un buen commit</span>
        </h1>

        <p class="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-md">
          Pedidos limpios, ingredientes frescos y cero conflictos de merge. Elige tus platos
          favoritos y sigue tu pedido en tiempo real, de la cocina a tu mesa.
        </p>

                <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            @click="scrollToCarta"
            class="bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Ver la carta
          </button>

          <router-link
            :to="{ name: 'mi-pedido' }"
            class="border border-outline text-on-surface px-6 py-3 rounded-lg font-semibold text-center hover:bg-surface-container-high transition"
          >
            Seguir mi pedido
          </router-link>
        </div>
      </div>

      <!-- Imagen -->
      <div class="order-1 md:order-2">
        <img
          :src="heroImage"
          alt="Plato variado de GitSushi con nigiris, rolls de sésamo y aguacate, y gyozas servido en una pizarra negra"
          class="w-full h-64 sm:h-80 md:h-full object-cover rounded-2xl shadow-lg"
        />
      </div>
    </div>
  </section>
</template>