import { expect, test } from '@playwright/test'
import { USERS, login } from './helpers'

// Recorrido 2: un cliente cambia su ciudad en el perfil, el backend la guarda
// (PUT /api/v1/users/{id}) y al recargar sigue cambiada. Al final la deja como estaba.
test('un cliente guarda los cambios de su perfil', async ({ page }) => {
  await login(page, USERS.customer)

  await page.goto('/perfil')
  const city = page.locator('#city')
  await expect(city).not.toHaveValue('')
  const originalCity = await city.inputValue()
  const newCity = `${originalCity} E2E`

  await city.fill(newCity)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Tus datos se han guardado.')).toBeVisible()

  await page.reload()
  await expect(page.locator('#city')).toHaveValue(newCity)

  await page.locator('#city').fill(originalCity)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Tus datos se han guardado.')).toBeVisible()
})