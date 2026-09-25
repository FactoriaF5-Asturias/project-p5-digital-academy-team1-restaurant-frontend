// src/mocks/orderHistory.mock.js
// Simula temporalmente el futuro endpoint GET /usuarios/{id}/pedidos (todavía no existe en el backend).
// Se sustituirá por la llamada real en cuanto el backend lo publique, igual que se hizo con tables.mock.js.

const ALL_ORDERS = [
  {
    id: 105,
    date: '2026-09-20T21:10:00',
    items: [
      { productId: 3, name: 'Kaisen Init', quantity: 1, price: 6.5 },
      { productId: 12, name: 'Gunkan Push', quantity: 2, price: 5.5 },
    ],
    total: 17.5,
  },
  {
    id: 104,
    date: '2026-09-15T20:30:00',
    items: [{ productId: 27, name: 'Caesar Commit', quantity: 1, price: 6.9 }],
    total: 6.9,
  },
  {
    id: 103,
    date: '2026-09-08T13:55:00',
    items: [
      { productId: 5, name: 'Wakame Loop', quantity: 2, price: 4.5 },
      { productId: 41, name: 'Gunkan Stack', quantity: 1, price: 5.9 },
    ],
    total: 14.9,
  },
  {
    id: 102,
    date: '2026-08-30T21:40:00',
    items: [{ productId: 1, name: 'Hello Edamame', quantity: 1, price: 3.5 }],
    total: 3.5,
  },
  {
    id: 101,
    date: '2026-08-22T14:05:00',
    items: [{ productId: 12, name: 'Gunkan Push', quantity: 1, price: 5.5 }],
    total: 5.5,
  },
]

const PAGE_SIZE = 3

// Simula la respuesta paginada real (misma forma que products.service.js: items/page/size/totalItems/totalPages).
export function getOrderHistory({ page = 1, size = PAGE_SIZE } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * size
      const items = ALL_ORDERS.slice(start, start + size)

      resolve({
        items,
        page,
        size,
        totalItems: ALL_ORDERS.length,
        totalPages: Math.ceil(ALL_ORDERS.length / size),
      })
    }, 300)
  })
}
