import { expect, test } from '@playwright/test'
import { USERS, login } from './helpers'

// Recorrido 4: un usuario de cocina no puede entrar en el panel de administración.
test('cocina no puede entrar en el panel de administración', async ({ page }) => {
  await login(page, USERS.cook)

  await page.goto('/admin')

  await expect(page).toHaveURL(/\/acceso-denegado$/)
  await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible()
})