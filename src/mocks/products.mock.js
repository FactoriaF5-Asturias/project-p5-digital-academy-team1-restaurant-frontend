// src/mocks/products.mock.js
//
// Datos de ejemplo (mock) para la vista Carta.
// PROVISIONAL: sustituir por la llamada real a GET /products cuando el
// backend implemente el endpoint. Los nombres de campo son una suposicion
// razonable a falta de confirmar el contrato real.

export const PRODUCT_CATEGORIES = {
  SUSHI: 'SUSHI',
  DRINKS: 'DRINKS',
  DESSERTS: 'DESSERTS',
}

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
    name: 'California Roll',
    description: 'Surimi, aguacate y pepino, con sésamo tostado.',
    price: 9.9,
    category: PRODUCT_CATEGORIES.SUSHI,
    imageUrl: 'https://placehold.co/300x200?text=California+Roll',
    active: true,
  },
  {
    id: 5,
    name: 'Té verde matcha',
    description: 'Té matcha ceremonial, servido frío o caliente.',
    price: 3.5,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Te+Matcha',
    active: true,
  },
  {
    id: 6,
    name: 'Ramune',
    description: 'Refresco japonés con canica, sabor original.',
    price: 3.2,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Ramune',
    active: true,
  },
  {
    id: 7,
    name: 'Sake Junmai',
    description: 'Sake tradicional, servido templado.',
    price: 5.9,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Sake',
    active: true,
  },
  {
    id: 8,
    name: 'Cerveza Asahi',
    description: 'Cerveza japonesa tipo lager, 33cl.',
    price: 4.2,
    category: PRODUCT_CATEGORIES.DRINKS,
    imageUrl: 'https://placehold.co/300x200?text=Asahi',
    active: true,
  },
  {
    id: 9,
    name: 'Mochi de té verde',
    description: 'Mochi relleno de helado de matcha, 3 unidades.',
    price: 5.5,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Mochi',
    active: true,
  },
  {
    id: 10,
    name: 'Taiyaki',
    description: 'Pastel en forma de pez relleno de crema de judía roja.',
    price: 4.0,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Taiyaki',
    active: true,
  },
  {
    id: 11,
    name: 'Helado de yuzu',
    description: 'Helado artesanal con cítrico japonés yuzu.',
    price: 4.5,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Yuzu',
    active: true,
  },
  {
    id: 12,
    name: 'Anmitsu',
    description: 'Gelatina de agar-agar con fruta y sirope de melaza negra.',
    price: 5.0,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Anmitsu',
    active: true,
  },
  {
    id: 13,
    name: 'Dorayaki',
    description: 'Bizcocho relleno de crema de judía roja (anko).',
    price: 4.5,
    category: PRODUCT_CATEGORIES.DESSERTS,
    imageUrl: 'https://placehold.co/300x200?text=Dorayaki',
    active: false, // desactivado por Administracion - sirve para probar el filtro
  },
]
