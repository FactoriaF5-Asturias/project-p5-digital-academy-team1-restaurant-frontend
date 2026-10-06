import { expect, test } from '@playwright/test'

// Recorrido 1: un invitado ve la carta que llega del backend, añade un plato
// a la cesta y lo quita con la ventana de confirmación de la app.
test('un invitado añade un plato a la cesta y lo quita', async ({ page }) => {
  await page.goto('/')

  const firstCard = page.locator('.product-card').first()
  await expect(firstCard).toBeVisible()
  const productName = (await firstCard.locator('.product-card__title').textContent()).trim()

  await firstCard.getByRole('button', { name: 'Añadir' }).click()
  await expect(firstCard.getByRole('button', { name: 'Añadido ✓' })).toBeVisible()

  // La cesta se guarda en el navegador, así que sigue ahí al cambiar de página.
  await page.goto('/cesta')
  await expect(page.getByRole('heading', { name: 'Tu cesta' })).toBeVisible()
  await expect(page.locator('.cart-summary__line-name')).toHaveText(productName)

  await page.getByRole('button', { name: `Eliminar ${productName} de la cesta` }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(productName)
  await dialog.getByRole('button', { name: 'Quitar' }).click()

  await expect(page.getByText('Tu cesta está vacía.')).toBeVisible()
})