import api from './api'

export async function getOrderHistory(
  userId,
  { page = 1, size = 3 } = {},
) {
  if (!userId) {
    throw new Error('No authenticated user available')
  }

  const { data } = await api.get(
    `/api/v1/users/${userId}/orders`,
    {
      params: {
        page: page - 1,
        size,
      },
    },
  )

  return {
    items: data.content,
    page: data.page.number + 1,
    size: data.page.size,
    totalItems: data.page.totalElements,
    totalPages: Math.max(1, data.page.totalPages),
  }
}