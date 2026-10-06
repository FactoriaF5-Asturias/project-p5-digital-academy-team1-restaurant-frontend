import { expect, test } from '@playwright/test'
import { USERS, apiGet, login, switchUser } from './helpers'

// Recorrido 5: ciclo completo de un pedido a domicilio pagado en efectivo.
// Cliente → cocina → reparto → facturación, con el backend real.
test('un pedido a domicilio en efectivo llega a facturación al cobrarse en la entrega', async ({ page }) => {
  // Recorre cuatro roles: necesita más tiempo que un test normal.
  test.setTimeout(90_000)
  let orderId

  await test.step('el cliente pide a domicilio con efectivo a la entrega', async () => {
    await login(page, USERS.customer)
    await page.locator('.product-card').first().getByRole('button', { name: 'Añadir' }).click()

    await page.goto('/cesta')
    await page.getByRole('button', { name: 'A domicilio' }).click()
    await page.locator('#address-street').fill('Calle Mayor 1')
    await page.locator('#address-city').fill('Avilés')
    await page.locator('#address-postal-code').fill('33400')
    await page.getByRole('radio', { name: 'Efectivo a la entrega' }).click()

    const orderCreated = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/v1/orders') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Confirmar y pagar pedido' }).click()
    const response = await orderCreated

    expect(response.status()).toBe(201)
    orderId = (await response.json()).id
        await expect(page.getByText('Pedido confirmado')).toContainText(
      'pendiente de cobro por el repartidor',
    )
  })

  await test.step('cocina prepara el pedido y lo marca listo', async () => {
    await switchUser(page, USERS.cook)
    await page.goto('/cocina')

    const card = page
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: `#${orderId}`, exact: true }) })
    await card.getByRole('button', { name: 'En curso' }).click()
    await expect(card.getByText('Estado: En preparación')).toBeVisible()
    await card.getByRole('button', { name: 'Listo pase' }).click()
    await expect(card.getByText('Estado: Listo')).toBeVisible()
  })

    await test.step('el repartidor acepta el pedido, lo entrega y confirma el cobro', async () => {
    await switchUser(page, USERS.delivery)
    await page.goto('/reparto')

    const pendingOrder = page
      .locator('.pending-deliveries__item')
      .filter({ has: page.getByText(`Pedido #${orderId}`, { exact: true }) })
    await pendingOrder.getByRole('button', { name: 'Aceptar y salir a repartir' }).click()
    await expect(pendingOrder).toHaveCount(0)

    const onTheWayOrder = page
      .locator('.on-the-way-orders__item')
      .filter({ has: page.getByText(`Pedido #${orderId}`, { exact: true }) })
    await onTheWayOrder.getByRole('button', { name: 'Marcar como ENTREGADO' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText(`#${orderId}`)
    await dialog.getByRole('button', { name: 'Sí, cobrado' }).click()
    await expect(onTheWayOrder).toHaveCount(0)
  })

  await test.step('el admin encuentra la factura del pedido en Facturación', async () => {
    await switchUser(page, USERS.admin)

    // La tabla muestra el nº de factura, no el de pedido: lo buscamos en la API.
    const invoices = await apiGet(page, '/api/v1/invoices?size=20')
    const invoice = invoices.content.find((item) => item.orderId === orderId)
    expect(invoice, `No se generó factura para el pedido #${orderId}`).toBeDefined()

    await page.goto('/admin/facturacion')
    await page.getByLabel('Buscar factura').fill(String(invoice.id))
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()

    const invoiceRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: `#${invoice.id}`, exact: true }) })
    await expect(invoiceRow).toBeVisible()
    await expect(invoiceRow).toContainText('Efectivo a la entrega')
  })
})