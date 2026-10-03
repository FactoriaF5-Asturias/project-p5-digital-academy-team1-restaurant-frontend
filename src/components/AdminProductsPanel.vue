<script setup>
import { ref, onMounted } from 'vue'
import { useAdminProducts } from '../composables/useAdminProducts'
import { useCategoryFilter } from '../composables/useCategoryFilter'
import { usePagination } from '../composables/usePagination'
import PaginationControl from './PaginationControl.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ProductFormModal from './ProductFormModal.vue'
import AdminProductsTable from './AdminProductsTable.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import CategoryFilters from './CategoryFilters.vue'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'

// Sección de gestión de productos del panel de administración.
// Coordina las piezas: pide los datos al composable, filtra, pagina y decide
// qué modal mostrar. Cada parte visual vive en su propio componente.

const TABLE_PAGE_SIZE = 7
const HTTP_CONFLICT = 409

const {
  products,
  isLoading,
  loadError,
  loadProducts,
  addProduct,
  editProduct,
  toggleAvailability,
  removeProduct,
} = useAdminProducts()

const actionError = ref('')

onMounted(loadProducts)

// --- Filtro por categoría ---
const {
  activeCategory,
  filterOptions: categoryFilterOptions,
  filteredItems: filteredProducts,
  setCategory,
} = useCategoryFilter(products)

// --- Paginación de la tabla ---
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedProducts,
  goToPage,
  resetPage,
} = usePagination(filteredProducts, TABLE_PAGE_SIZE)

function selectCategory(category) {
  setCategory(category)
  resetPage()
}

async function handleToggleAvailability(product) {
  actionError.value = ''
  try {
    await toggleAvailability(product)
  } catch (err) {
    actionError.value = 'No se ha podido cambiar el estado del producto. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al cambiar el estado:', err)
  }
}

// --- Desactivar producto ---
// Activar no necesita confirmación; desactivar sí, porque lo quita de la carta.
const productToDeactivate = ref(null)

function requestToggleAvailability(product) {
  if (!product.available) return handleToggleAvailability(product)
  productToDeactivate.value = product
}

function cancelDeactivate() {
  productToDeactivate.value = null
}

function confirmDeactivate() {
  const product = productToDeactivate.value
  productToDeactivate.value = null
  return handleToggleAvailability(product)
}

// --- Eliminar producto ---
const productToDelete = ref(null)

function requestDelete(product) {
  productToDelete.value = product
}

function cancelDelete() {
  productToDelete.value = null
}

function confirmDelete() {
  removeProduct(productToDelete.value.id)
  productToDelete.value = null
}

// --- Formulario de producto (añadir y editar) ---
const formMode = ref(null)
const productBeingEdited = ref(null)
const isSavingForm = ref(false)
const formError = ref('')

function openCreateForm() {
  productBeingEdited.value = null
  formError.value = ''
  formMode.value = PRODUCT_FORM_MODES.CREATE
}

function openEditForm(product) {
  productBeingEdited.value = product
  formError.value = ''
  formMode.value = PRODUCT_FORM_MODES.EDIT
}

function closeForm() {
  formMode.value = null
  productBeingEdited.value = null
}

async function saveNewProduct(formData) {
  try {
    await addProduct(formData)
    closeForm()
  } catch (err) {
    formError.value =
      err.response?.status === HTTP_CONFLICT
        ? 'Ya existe un producto con ese nombre.'
        : 'No se ha podido guardar el producto. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al crear el producto:', err)
  }
}

async function saveProductChanges(formData) {
  try {
    await editProduct(productBeingEdited.value, formData)
    closeForm()
  } catch (err) {
    formError.value = 'No se han podido guardar los cambios. Inténtalo de nuevo.'
    console.error('[AdminProductsPanel] Error al editar el producto:', err)
  }
}

async function handleFormSubmit(formData) {
  formError.value = ''
  isSavingForm.value = true
  if (formMode.value === PRODUCT_FORM_MODES.CREATE) {
    await saveNewProduct(formData)
  } else {
    await saveProductChanges(formData)
  }
  isSavingForm.value = false
}
</script>

<template>
  <section class="admin-products">
    <header class="admin-products__header">
      <div>
        <h2 class="admin-products__title">Gestión de Productos de la Carta</h2>
        <p class="admin-products__subtitle">Consulta el estado de los productos por categoría.</p>
      </div>
      <button type="button" class="admin-products__add-button" @click="openCreateForm">
        + Añadir nuevo producto a la carta
      </button>
    </header>

    <!-- Filtros por categoría -->
    <CategoryFilters
      :options="categoryFilterOptions"
      :active-category="activeCategory"
      @select-category="selectCategory"
    />

    <p v-if="actionError" class="admin-products__action-error">{{ actionError }}</p>

    <!-- Tabla de productos -->
    <LoadingSpinner v-if="isLoading" label="Cargando productos..." />
    <p v-else-if="loadError" class="admin-products__load-error">{{ loadError }}</p>
    <div v-else class="admin-products__table-wrapper">
      <AdminProductsTable
        :products="paginatedProducts"
        @toggle-availability="requestToggleAvailability"
        @edit="openEditForm"
        @delete="requestDelete"
      />

      <PaginationControl
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="goToPage"
      />
    </div>

        <!-- Confirmación de desactivar -->
    <ConfirmDialog
      v-if="productToDeactivate"
      title="¿Desactivar producto?"
      confirm-label="Desactivar"
      @confirm="confirmDeactivate"
      @cancel="cancelDeactivate"
    >
      <strong>{{ productToDeactivate.name }}</strong> dejará de aparecer en la carta y los
      clientes no podrán pedirlo hasta que lo vuelvas a activar.
    </ConfirmDialog>

    <!-- Confirmación de borrado -->
    <ConfirmDialog
      v-if="productToDelete"
      title="¿Eliminar producto?"
      confirm-label="Eliminar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      Esta acción es permanente y no se puede deshacer. Vas a eliminar
      <strong>{{ productToDelete.name }}</strong> de la carta.
    </ConfirmDialog>

    <!-- Formulario de producto (añadir y editar) -->
    <ProductFormModal
      v-if="formMode"
      :mode="formMode"
      :initial-product="productBeingEdited"
      :is-saving="isSavingForm"
      :error-message="formError"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </section>
</template>

<style scoped>
@reference "../style.css";

.admin-products {
  @apply bg-white border border-outline rounded-xl p-5;
}

.admin-products__header {
  @apply flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4;
}

.admin-products__title {
  @apply text-xl font-heading font-bold text-on-surface;
}

.admin-products__subtitle {
  @apply text-on-surface-variant text-sm;
}

.admin-products__add-button {
  @apply bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition self-start sm:self-auto whitespace-nowrap;
}

.admin-products__action-error {
  @apply mb-3 text-error text-sm;
}

.admin-products__load-error {
  @apply py-6 text-center text-error;
}

.admin-products__table-wrapper {
  @apply overflow-x-auto;
}
</style>