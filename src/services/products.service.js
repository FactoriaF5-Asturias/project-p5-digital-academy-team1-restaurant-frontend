import api from './api'

const PRODUCTS_ENDPOINT = '/api/v1/products'
export const DEFAULT_PAGE_SIZE = 12

export async function getProducts({ page = 1, size = DEFAULT_PAGE_SIZE, category = null } = {}) {
  const response = await api.get(PRODUCTS_ENDPOINT, {
    params: {
      page: page - 1,
      size,
      ...(category ? { category } : {}),
    },
  })

  const {
    content,
    totalElements,
    totalPages,
    number,
    first,
    last,
  } = response.data

  return {
    items: content,
    page: number + 1,
    size,
    totalItems: totalElements,
    totalPages,
    isFirstPage: first,
    isLastPage: last,
  }
}
