// src/mocks/tables.mock.js

// Simula la respuesta del backend mientras (identificación de mesa
// por dispositivo) no esté implementado. Cuando exista el endpoint real,
// esta función se sustituye por una llamada con axios en tables.service.js,
// sin tocar el resto de la cadena (composable, store, componente).
export function getLinkedTableMock() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ tableNumber: 5 }), 300)
  })
}
