# GitSushi

🔗 [Repositorio en GitHub](https://github.com/FactoriaF5-Asturias/project-p5-digital-academy-team1-restaurant-frontend)

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/) [![Vite](https://img.shields.io/badge/build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/) [![Pinia](https://img.shields.io/badge/state-Pinia-FFD859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)

<a id="index"></a>

# 📑 Índice
- [📖 Descripción](#description)
- [🧪 Tests y cobertura](#testing)
- [🚀 indicartitulo](#indicarid)

<a id="description"></a>

## Descripción

GitSushi es una aplicación web de pedidos para un restaurante de sushi, desarrollada como proyecto grupal en Factoría F5 (equipo de 7 personas: 4 backend / 3 frontend). Permite a los clientes consultar la carta filtrada por categoría, añadir productos a la cesta y realizar un pedido, además de revisar su perfil y el estado de sus pedidos anteriores. Para el personal del restaurante, incluye una vista de cocina para gestionar los pedidos en curso, una vista de reparto para el seguimiento de entregas, y un panel de administración para gestionar los productos de la carta (alta, edición, stock y disponibilidad). Construida con Vue 3 (Vite, Vue Router y Pinia) en el frontend

[↑ Índice](#index) • [indicartitulo →](#indicarid)


[← indicartitulo](#iindicarid) • [↑ Índice](#index) • [Tests y cobertura →](#testing)

<a id="testing"></a>

## Tests y cobertura

Ejecutar los tests:

\`\`\`bash
npm run test
\`\`\`

Ejecutar los tests generando el informe de cobertura:

\`\`\`bash
npm run test:coverage
\`\`\`

Este comando muestra en la terminal el porcentaje de cobertura por archivo y el total del proyecto, y además genera un informe HTML más detallado en `coverage/index.html` — ábrelo en el navegador para ver línea por línea qué está cubierto y qué no.

El proyecto exige un mínimo de **70% de cobertura** (líneas, funciones, branches y statements, configurado en `vite.config.js`). Si la cobertura total cae por debajo de ese umbral, el comando termina con error indicando qué métrica no lo alcanzó.

Este chequeo también se ejecuta automáticamente en cada Pull Request contra `dev`/`main` mediante GitHub Actions (`.github/workflows/tests.yml`).

[← Descripción](#description) • [↑ Índice](#index) • [XXXX →](#indicaridsiguiente)