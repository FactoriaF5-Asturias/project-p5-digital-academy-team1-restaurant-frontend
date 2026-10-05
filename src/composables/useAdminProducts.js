import { ref } from 'vue'
import { getAdminProducts, createProduct, updateProduct } from '../services/products.service'

const DEFAULT_DISCOUNT = 0
const LOAD_ERROR_MESSAGE = 'No se han podido cargar los productos. Inténtalo de nuevo más tarde.'

export function useAdminProducts() {
  const products = ref([])
  const isLoading = ref(false)
  const loadError = ref('')

  async function loadProducts() {
    isLoading.value = true
    loadError.value = ''
    try {
      products.value = await getAdminProducts()
    } catch (err) {
      loadError.value = LOAD_ERROR_MESSAGE
      console.error('[useAdminProducts] Error al obtener los productos:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(productData) {
    const createdProduct = await createProduct({
      ...productData,
      discount: DEFAULT_DISCOUNT,
      available: true,
      exclusive: false,
    })
    products.value.push(createdProduct)
    return createdProduct
  }

  async function editProduct(product, changes) {
    const updatedProduct = await updateProduct(product.id, changes)
    Object.assign(product, updatedProduct)
    return product
  }

  function toggleAvailability(product) {
    return editProduct(product, { available: !product.available })
  }

  // Solo en pantalla hasta que el backend tenga DELETE /products/{id}
  function removeProduct(productId) {
    products.value = products.value.filter((p) => p.id !== productId)
  }

  return {
    products,
    isLoading,
    loadError,
    loadProducts,
    addProduct,
    editProduct,
    toggleAvailability,
    removeProduct,
  }
}