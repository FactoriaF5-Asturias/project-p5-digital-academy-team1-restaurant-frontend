import api from './api'

const PRODUCTS_ENDPOINT = '/api/v1/products'
export const DEFAULT_PAGE_SIZE = 12

const ADMIN_PRODUCTS_ENDPOINT = `${PRODUCTS_ENDPOINT}/administration`
export const ADMIN_PAGE_SIZE = 100

export async function getProducts({ page = 1, size = DEFAULT_PAGE_SIZE, category = null } = {}) {
  const response = await api.get(PRODUCTS_ENDPOINT, {
    params: {
      page: page - 1,
      size,
      ...(category ? { category } : {}),
    },
  })

  const { content, page: pageInfo } = response.data
  const { totalElements, totalPages, number } = pageInfo

  return {
    items: content,
    page: number + 1,
    size,
    totalItems: totalElements,
    totalPages,
  }
}

export async function getAdminProducts() {
  const response = await api.get(ADMIN_PRODUCTS_ENDPOINT, {
    params: { page: 0, size: ADMIN_PAGE_SIZE },
  })

  return response.data.content
}

export async function updateProduct(id, changes) {
  const response = await api.patch(`${PRODUCTS_ENDPOINT}/${id}`, changes)
  return response.data
}

export async function createProduct(product) {
  const response = await api.post(PRODUCTS_ENDPOINT, product)
  return response.data
}
