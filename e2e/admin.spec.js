import { expect, test } from '@playwright/test'
import { USERS, login } from './helpers'

// Recorrido 3: el administrador ve la carta sin poder comprar y gestiona
// los usuarios reales que devuelve el backend.
test('el admin ve la carta en solo lectura y la lista de usuarios', async ({ page }) => {
  await login(page, USERS.admin)

  await expect(page.locator('.product-card').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Añadir' })).toHaveCount(0)

  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Panel de administración' })).toBeVisible()

  await page.goto('/admin/usuarios')
  await expect(page.getByRole('heading', { name: 'Gestión de usuarios' })).toBeVisible()
  await expect(page.getByRole('cell', { name: USERS.customer.email })).toBeVisible()
  await expect(page.getByRole('cell', { name: USERS.admin.email })).toBeVisible()
})