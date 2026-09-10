// src/mocks/products.mock.js
//
// Datos de ejemplo (mock) para la vista Carta.
// PROVISIONAL: sustituir por la llamada real a GET /products en cuanto
// el backend implemente el endpoint. Los nombres de campo son
// una suposicion razonable (id, name, description, price, category,
// imageUrl, active) porque el DTO del backend esta aun vacio - hay que
// confirmarlos con el equipo de backend cuando lo implementen.

export const PRODUCT_CATEGORIES = {
  SUSHI: 'SUSHI',
  DRINKS: 'DRINKS',
  DESSERTS: 'DESSERTS',
}

// OJO: el enum del backend usa "SUSHI" para lo que el enunciado llama
// "Especialidades" - confirmar con backend si ese nombre va a cambiar.
export const CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.SUSHI]: 'Especialidades',
  [PRODUCT_CATEGORIES.DRINKS]: 'Bebidas',
  [PRODUCT_CATEGORIES.DESSERTS]: 'Postres',
}

export const mockProducts = [
  {
    id: 1,
    name: 'Dragon Roll',
    description: 'Tempura de langostino, aguacate y salsa unagi.',
    price: 12.5,
    category: PRODUCT_CATEGORIES.SUSHI,
    imageUrl: 'https://placehold.co/300x200?text=Dragon+Roll',
    active: true,
  },
  {
    id: 2,
    name: 'Nigiri de salmón',
    description: 'Salmón fresco sobre arroz avinagrado, 2 piezas.',
    price: 6.9,
    category: PRODUCT_CATEGORIES.SUSHI,
    imageUrl: 'https://placehold.co/300x200?text=Nigiri+Salmon',
    active: true,
  },
  {
    id: 3,
    name: 'Ramen picante',
    description: 'Caldo especiado, cerdo chashu, huevo marinado y fideos.',
    price: 13.9,
    category: PRODUCT_CATEGORIES.SUSHI,
    imageUrl: 'https://placehold.co/300x200?text=Ramen',
    active: true,
  },
  {
    id: 4,
    name: 'Té verde matcha',
    description: 'Té matcha ceremonial, servido frío o caliente.',
    price: 3.5,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Te+Matcha',
    active: true,
  },
  {
    id: 5,
    name: 'Ramune',
    description: 'Refresco japonés con canica, sabor original.',
    price: 3.2,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Ramune',
    active: true,
  },
  {
    id: 6,
    name: 'Mochi de té verde',
    description: 'Mochi relleno de helado de matcha, 3 unidades.',
    price: 5.5,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Mochi',
    active: true,
  },
  {
    id: 7,
    name: 'Dorayaki',
    description: 'Bizcocho relleno de crema de judía roja (anko).',
    price: 4.5,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Dorayaki',
    active: false, // desactivado por Administracion - sirve para probar el filtro
  },
]
