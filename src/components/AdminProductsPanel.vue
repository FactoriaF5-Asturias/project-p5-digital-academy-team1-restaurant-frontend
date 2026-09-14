<script setup>
import { ref, computed, reactive } from 'vue'

const categories = ['Todas', 'Especialidades', 'Bebidas', 'Postres']
const activeCategory = ref('Todas')

const LOW_STOCK_THRESHOLD = 5

// Datos de ejemplo (mock) mientras el backend no tiene los endpoints listos (GS-22 / GS-24)
const products = ref([
  { id: 1, name: 'Deploy Deluxe', description: 'Selección del chef, 20 piezas. Solo clientes registrados.', category: 'Especialidades', price: 29.90, active: true, stock: 12 },
  { id: 2, name: 'Branch Gyozas', description: 'Gyozas caseras de cerdo y jengibre. 5 unidades al vapor.', category: 'Especialidades', price: 7.80, active: true, stock: 4 },
  { id: 3, name: 'Sake Junmai', description: 'Copa de sake seco tradicional servido frío.', category: 'Bebidas', price: 6.50, active: false, stock: 0 },
  { id: 4, name: 'Cerveza Asahi', description: 'Botellín 33 cl. Cerveza japonesa Super Dry.', category: 'Bebidas', price: 4.20, active: true, stock: 30 },
  { id: 5, name: 'Cheesecake de Yuzu', description: 'Tarta cremosa con coulis cítrico de yuzu.', category: 'Postres', price: 6.20, active: true, stock: 3 },
])

const categoryCounts = computed(() => {
  const counts = { Todas: products.value.length }
  for (const cat of categories.slice(1)) {
    counts[cat] = products.value.filter((p) => p.category === cat).length
  }
  return counts
})

const filteredProducts = computed(() => {
  if (activeCategory.value === 'Todas') return products.value
  return products.value.filter((p) => p.category === activeCategory.value)
})

function toggleActive(product) {
  product.active = !product.active
}

function isLowStock(product) {
  return product.stock <= LOW_STOCK_THRESHOLD
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
  products.value = products.value.filter((p) => p.id !== productToDelete.value.id)
  productToDelete.value = null
}

// --- Añadir producto ---
const showAddForm = ref(false)
const addFormError = ref('')
const newProduct = reactive({
  name: '',
  category: 'Especialidades',
  price: '',
  stock: '',
  description: '',
})

function openAddForm() {
  newProduct.name = ''
  newProduct.category = 'Especialidades'
  newProduct.price = ''
  newProduct.stock = ''
  newProduct.description = ''
  addFormError.value = ''
  showAddForm.value = true
}

function closeAddForm() {
  showAddForm.value = false
}

function submitAddForm() {
  const priceNumber = parseFloat(newProduct.price)
  const stockNumber = parseInt(newProduct.stock, 10)

  if (!newProduct.name.trim() || !newProduct.description.trim() || !newProduct.price || newProduct.stock === '') {
    addFormError.value = 'Completa nombre, precio, stock inicial y descripción.'
    return
  }
  if (isNaN(priceNumber) || priceNumber <= 0) {
    addFormError.value = 'Ingresa un precio válido mayor a 0.'
    return
  }
  if (isNaN(stockNumber) || stockNumber < 0) {
    addFormError.value = 'Ingresa una cantidad de stock válida (0 o mayor).'
    return
  }

  const nextId = products.value.length > 0 ? Math.max(...products.value.map((p) => p.id)) + 1 : 1

  products.value.push({
    id: nextId,
    name: newProduct.name.trim(),
    description: newProduct.description.trim(),
    category: newProduct.category,
    price: priceNumber,
    stock: stockNumber,
    active: true,
  })

  showAddForm.value = false
}

// --- Editar producto (nombre, categoría, precio, stock, descripción) ---
const editingProduct = ref(null)
const editProductForm = reactive({
  name: '',
  category: 'Especialidades',
  price: '',
  stock: '',
  description: '',
})
const editProductOriginal = reactive({
  name: '',
  category: '',
  price: '',
  stock: '',
  description: '',
})
const editProductError = ref('')

function openEditProduct(product) {
  editingProduct.value = product

  editProductForm.name = product.name
  editProductForm.category = product.category
  editProductForm.price = product.price
  editProductForm.stock = product.stock
  editProductForm.description = product.description

  // Copia aparte de los valores originales, para poder comparar y saber si algo cambió
  editProductOriginal.name = product.name
  editProductOriginal.category = product.category
  editProductOriginal.price = product.price
  editProductOriginal.stock = product.stock
  editProductOriginal.description = product.description

  editProductError.value = ''
}

function closeEditProduct() {
  editingProduct.value = null
}

const hasEditChanges = computed(() => {
  if (!editingProduct.value) return false
  return (
    editProductForm.name !== editProductOriginal.name ||
    editProductForm.category !== editProductOriginal.category ||
    String(editProductForm.price) !== String(editProductOriginal.price) ||
    String(editProductForm.stock) !== String(editProductOriginal.stock) ||
    editProductForm.description !== editProductOriginal.description
  )
})

function incrementEditStock() {
  const current = parseInt(editProductForm.stock, 10)
  editProductForm.stock = (isNaN(current) ? 0 : current) + 1
}

function decrementEditStock() {
  const current = parseInt(editProductForm.stock, 10)
  const next = (isNaN(current) ? 0 : current) - 1
  editProductForm.stock = next < 0 ? 0 : next
}

function submitEditProduct() {
  const priceNumber = parseFloat(editProductForm.price)
  const stockNumber = parseInt(editProductForm.stock, 10)

  if (!editProductForm.name.trim() || !editProductForm.description.trim() || !editProductForm.price || editProductForm.stock === '') {
    editProductError.value = 'Completa nombre, precio, stock y descripción.'
    return
  }
  if (isNaN(priceNumber) || priceNumber <= 0) {
    editProductError.value = 'Ingresa un precio válido mayor a 0.'
    return
  }
  if (isNaN(stockNumber) || stockNumber < 0) {
    editProductError.value = 'Ingresa una cantidad de stock válida (0 o mayor).'
    return
  }

  editingProduct.value.name = editProductForm.name.trim()
  editingProduct.value.category = editProductForm.category
  editingProduct.value.price = priceNumber
  editingProduct.value.stock = stockNumber
  editingProduct.value.description = editProductForm.description.trim()

  editingProduct.value = null
}
</script>

<template>
  <section class="bg-white border border-outline rounded-xl p-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h2 class="text-xl font-heading font-bold text-on-surface">Gestión de Productos de la Carta</h2>
        <p class="text-on-surface-variant text-sm">Consulta el estado de los productos por categoría.</p>
      </div>
      <button
        type="button"
        @click="openAddForm"
        class="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition self-start sm:self-auto whitespace-nowrap"
      >
        + Añadir nuevo producto a la carta
      </button>
    </div>

    <!-- Filtros por categoría -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        @click="activeCategory = cat"
        :class="[
          'px-3 py-1.5 rounded-full text-sm font-semibold border transition',
          activeCategory === cat
            ? 'bg-primary text-on-primary border-primary'
            : 'bg-surface-variant text-on-surface-variant border-outline hover:border-primary/50',
        ]"
      >
        {{ cat }} ({{ categoryCounts[cat] }})
      </button>
    </div>

    <!-- Tabla de productos -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-on-surface-variant uppercase text-xs border-b border-outline">
            <th class="py-2 pr-3">Producto</th>
            <th class="py-2 pr-3">Categoría</th>
            <th class="py-2 pr-3">Precio</th>
            <th class="py-2 pr-3">Stock</th>
            <th class="py-2 pr-3">Estado</th>
            <th class="py-2 pr-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="6" class="py-6 text-center text-on-surface-variant">
              No hay productos en esta categoría.
            </td>
          </tr>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="border-b border-outline last:border-0"
          >
            <td class="py-3 pr-3">
              <div class="font-semibold text-on-surface">{{ product.name }}</div>
              <div class="text-on-surface-variant text-xs">{{ product.description }}</div>
            </td>
            <td class="py-3 pr-3 text-on-surface-variant">{{ product.category }}</td>
            <td class="py-3 pr-3 font-semibold text-on-surface">{{ product.price.toFixed(2) }} €</td>
            <td class="py-3 pr-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
                  isLowStock(product) ? 'bg-error-container text-error' : 'bg-surface-variant text-on-surface-variant',
                ]"
              >
                <span v-if="isLowStock(product)">⚠️</span>
                {{ product.stock }} uds.
              </span>
            </td>
            <td class="py-3 pr-3">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold',
                  product.active ? 'bg-secondary-container text-secondary' : 'bg-surface-variant text-on-surface-variant',
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', product.active ? 'bg-secondary' : 'bg-on-surface-variant']"></span>
                {{ product.active ? 'Activo' : 'Desactivado' }}
              </span>
            </td>
            <td class="py-3 pr-3 text-right whitespace-nowrap">
              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  @click="toggleActive(product)"
                  class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline hover:bg-surface-container-high transition"
                >
                  {{ product.active ? 'Desactivar' : 'Activar' }}
                </button>
                <button
                  type="button"
                  @click="openEditProduct(product)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:text-primary hover:border-primary/50 transition"
                  aria-label="Editar producto"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  @click="requestDelete(product)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:text-error hover:border-error/50 transition"
                  aria-label="Eliminar producto"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación de borrado -->
    <div
      v-if="productToDelete"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
        <h3 class="text-lg font-heading font-bold text-on-surface mb-2">¿Eliminar producto?</h3>
        <p class="text-on-surface-variant text-sm mb-5">
          Esta acción es permanente y no se puede deshacer. Vas a eliminar
          <span class="font-semibold text-on-surface">{{ productToDelete.name }}</span> de la carta.
        </p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="cancelDelete"
            class="px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para añadir nuevo producto -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h3 class="text-lg font-heading font-bold text-on-surface mb-4">Añadir nuevo producto a la carta</h3>

        <form @submit.prevent="submitAddForm" class="flex flex-col gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre</label>
            <input
              v-model="newProduct.name"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
              placeholder="Ej. Merge Nigiri"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
            <select
              v-model="newProduct.category"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
            >
              <option v-for="cat in categories.slice(1)" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Precio (€)</label>
              <input
                v-model="newProduct.price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
                placeholder="Ej. 12.50"
              />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Stock inicial</label>
              <input
                v-model="newProduct.stock"
                type="number"
                step="1"
                min="0"
                class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
                placeholder="Ej. 20"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Descripción</label>
            <textarea
              v-model="newProduct.description"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary resize-none"
              placeholder="Breve descripción del producto"
            ></textarea>
          </div>

          <p v-if="addFormError" class="text-error text-sm">{{ addFormError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeAddForm"
              class="px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para editar producto -->
    <div
      v-if="editingProduct"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h3 class="text-lg font-heading font-bold text-on-surface mb-4">Editar producto</h3>

        <form @submit.prevent="submitEditProduct" class="flex flex-col gap-3">
          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Nombre</label>
            <input
              v-model="editProductForm.name"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Categoría</label>
            <select
              v-model="editProductForm.category"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
            >
              <option v-for="cat in categories.slice(1)" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Precio (€)</label>
              <input
                v-model="editProductForm.price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary"
              />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-on-surface-variant mb-1">Stock</label>
              <div class="flex items-center border border-outline rounded-lg overflow-hidden">
                <button
                  type="button"
                  @click="decrementEditStock"
                  class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition"
                  aria-label="Disminuir stock"
                >
                  −
                </button>
                <input
                  v-model="editProductForm.stock"
                  type="number"
                  min="0"
                  step="1"
                  class="flex-1 w-0 text-center border-x border-outline text-sm outline-none py-2"
                />
                <button
                  type="button"
                  @click="incrementEditStock"
                  class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition"
                  aria-label="Aumentar stock"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-on-surface-variant mb-1">Descripción</label>
            <textarea
              v-model="editProductForm.description"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary resize-none"
            ></textarea>
          </div>

          <p v-if="editProductError" class="text-error text-sm">{{ editProductError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="closeEditProduct"
              class="px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition"
            >
              Cancelar
            </button>
            <button
              v-if="hasEditChanges"
              type="submit"
              class="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>