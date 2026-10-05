import { ref, computed, watch } from 'vue'

const FIRST_PAGE = 1

// Pagina en el front una lista reactiva (ref o computed) en bloques de pageSize.
// Sirve para cualquier lista: no sabe nada de productos.
export function usePagination(items, pageSize) {
  const currentPage = ref(FIRST_PAGE)

  const totalPages = computed(() =>
    Math.max(FIRST_PAGE, Math.ceil(items.value.length / pageSize))
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  function goToPage(page) {
    if (page < FIRST_PAGE || page > totalPages.value) return
    currentPage.value = page
  }

  function resetPage() {
    currentPage.value = FIRST_PAGE
  }

  // Si la lista se hace más corta (por ejemplo, al borrar) y la página actual
  // deja de existir, vuelve a la última que sí existe.
  watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal) currentPage.value = newTotal
  })

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    resetPage,
  }
}