import { ref } from 'vue'
import { getPaidInvoices } from '../services/invoices.service'

// Responsabilidad: estado de la tabla de facturas (lista, carga, error,
// página actual y búsqueda). Cada cambio de página o de búsqueda pide los datos
// al backend, que es quien filtra y pagina.

const FIRST_PAGE = 1
const LOAD_ERROR_MESSAGE = 'No se han podido cargar las facturas. Inténtalo de nuevo más tarde.'

export function usePaidInvoices() {
  const invoices = ref([])
  const isLoading = ref(false)
  const loadError = ref('')
  const currentPage = ref(FIRST_PAGE)
  const totalPages = ref(0)
  const searchTerm = ref('')

  async function loadInvoices() {
    isLoading.value = true
    loadError.value = ''

    try {
      const result = await getPaidInvoices({
        page: currentPage.value,
        search: searchTerm.value,
      })
      invoices.value = result.items
      totalPages.value = result.totalPages
    } catch (err) {
      invoices.value = []
      totalPages.value = 0
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[usePaidInvoices] Error al obtener las facturas:', err)
    } finally {
      isLoading.value = false
    }
  }

  function goToPage(page) {
    if (page < FIRST_PAGE || page > totalPages.value) return
    currentPage.value = page
    return loadInvoices()
  }

  // Una búsqueda nueva siempre empieza en la primera página.
  function search(term) {
    searchTerm.value = term
    currentPage.value = FIRST_PAGE
    return loadInvoices()
  }

  return {
    invoices,
    isLoading,
    loadError,
    currentPage,
    totalPages,
    searchTerm,
    loadInvoices,
    goToPage,
    search,
  }
}