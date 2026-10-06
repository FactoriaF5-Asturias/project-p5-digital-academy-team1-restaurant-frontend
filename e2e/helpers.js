import { expect, test } from '@playwright/test'

// URL del backend: la usamos solo para los pasos que aún no tienen pantalla
// y para comprobar datos. Por defecto, el back local con HTTPS.
export const API_URL = process.env.E2E_API_URL ?? 'https://localhost:8443'

// Usuarios de prueba que crea el backend en data.sql. Las contraseñas no se
// guardan en el repo: llegan por variables de entorno desde .env.e2e.
export const USERS = Object.freeze({
  customer: { email: 'customer@gitsushi.com', passwordVar: 'E2E_CUSTOMER_PASSWORD' },
  admin: { email: 'admin@gitsushi.com', passwordVar: 'E2E_ADMIN_PASSWORD' },
  cook: { email: 'cook@gitsushi.com', passwordVar: 'E2E_COOK_PASSWORD' },
  delivery: { email: 'delivery@gitsushi.com', passwordVar: 'E2E_DELIVERY_PASSWORD' },
})

// Salta el test si falta la contraseña, en vez de fallar con un error confuso.
export function requirePassword(user) {
  const password = process.env[user.passwordVar]
  test.skip(!password, `Falta ${user.passwordVar} en .env.e2e`)
  return password
}

// Inicia sesión desde el formulario, igual que una persona, y espera a volver a la carta.
export async function login(page, user) {
  const password = requirePassword(user)

  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(user.email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Nuestra carta' })).toBeVisible()
}

// Cambia de usuario en el mismo navegador: borra la sesión y entra con otro rol.
export async function switchUser(page, user) {
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await login(page, user)
}

// Llamadas a la API con la sesión del usuario que está en el navegador.
export async function apiGet(page, path) {
  const response = await page.request.get(`${API_URL}${path}`)
  expect(response.ok(), `GET ${path} → ${response.status()}`).toBe(true)
  return response.json()
}