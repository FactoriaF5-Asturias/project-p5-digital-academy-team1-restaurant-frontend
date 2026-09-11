<script setup>
// Team roster for the "Overview de los devs" section.
// To add a new teammate: append { name, username } to the array whose column
// needs the entry, keeping each column sorted alphabetically by first name.
// The GitHub icon + "Name (@username)" pattern below is the one to reuse.
const leftDevs = [
  { name: 'Andrea', username: 'andreaperezgon' },
  { name: 'Danil', username: 'danielmuntyanu' },
  { name: 'Ioana', username: 'Alexapop' },
  { name: 'Jose', username: 'Josecgh' },
]

const rightDevs = [
  { name: 'Luisa', username: 'lcortes89' },
  { name: 'Nieves', username: 'duran-ni' },
  { name: 'Raana', username: 'Raana-1375' },
]

const devColumns = [leftDevs, rightDevs]

function githubUrl(username) {
  return `https://github.com/${username}`
}
</script>

<template>
  <footer class="bg-surface-variant border-t border-outline">
    <div class="max-w-[1200px] mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
      <!-- Brand -->
      <div class="md:col-span-5 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <span class="text-primary text-lg font-bold">◆</span>
          <span class="text-on-surface font-bold text-lg">GitSushi</span>
        </div>
        <p class="text-on-surface-variant text-sm leading-relaxed">
          Programmed to perfection. Sushi de autor, pedido en sala con tablet o a domicilio.
          Diseñado para degustar commits limpios y nigiris de alta precisión culinaria.
        </p>
      </div>

      <!-- Restaurante -->
      <div class="md:col-span-4 flex flex-col gap-2">
        <span class="text-primary text-xs font-bold uppercase tracking-widest">Restaurante</span>
        <ul class="flex flex-col gap-2 text-sm text-on-surface-variant">
          <li class="flex items-center gap-2">
            <span aria-hidden="true">📍</span>
            Calle Repositorio 42, Madrid
          </li>
          <li class="flex items-center gap-2">
            <span aria-hidden="true">🕐</span>
            Todos los días 13:00 a 23:30
          </li>
          <li class="flex items-center gap-2 text-secondary font-mono text-xs">
            <span aria-hidden="true">✉️</span>
            hola@gitsushi.dev
          </li>
        </ul>
      </div>

      <!-- Overview de los devs -->
      <div class="md:col-span-3 flex flex-col gap-2">
        <span class="text-secondary text-xs font-bold uppercase tracking-widest">
          devs
        </span>
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <ul v-for="(column, index) in devColumns" :key="index" class="flex flex-col gap-2">
            <li
              v-for="dev in column"
              :key="dev.username"
              class="flex items-center gap-2 text-xs font-mono text-on-surface-variant whitespace-nowrap"
            >
              <svg
                class="w-4 h-4 text-secondary shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              <a :href="githubUrl(dev.username)"
                target="_blank"
                rel="noopener noreferrer"
                :title="'@' + dev.username"
                :aria-label="`Perfil de GitHub de ${dev.name}, usuario ${dev.username}`"
                class="text-primary hover:underline"
              >{{ dev.name }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-outline">
      <div class="max-w-[1200px] mx-auto px-5 py-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center font-mono text-[11.5px] text-on-surface-variant">
        <span>© 2026 GitSushi — commit &amp; eat. All repositories staged.</span>
      </div>
    </div>
  </footer>
</template>