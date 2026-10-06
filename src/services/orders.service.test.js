import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOrder, getOrdersByStatus } from './orders.service'
import api from './api'

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('./tables.service', () => ({
  getDeviceIdentifier: vi.fn(() => 'device-123'),
}))

describe('orders.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the items, chefNote, channel and paymentMethod to the orders endpoint', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })
    const items = [{ productId: 1, quantity: 2 }]

    await createOrder({
      items,
      chefNote: 'Sin wasabi',
      channel: 'sala',
      paymentMethod: 'CASH_ONSITE',
    })

    expect(api.post).toHaveBeenCalledWith("/api/v1/orders", {
      items,
      chefNote: "Sin wasabi",
      channel: "ONSITE",
      paymentMethod: "CASH_ONSITE",
    }, { headers: { 'Device-Identifier': 'device-123' } });
  });

  it("sends the table number as a number and the device identifier header", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });

    await createOrder({
      items: [],
      chefNote: "",
      channel: "sala",
      paymentMethod: "CARD_ONSITE",
      tableNumber: "7",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/orders",
      expect.objectContaining({ tableNumber: 7 }),
      { headers: { 'Device-Identifier': 'device-123' } },
    );
  });

  it('translates the "domicilio" channel to the backend "ONLINE" value', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })

    await createOrder({
      items: [],
      chefNote: '',
      channel: 'domicilio',
      paymentMethod: 'ONLINE_CARD',
    })

    expect(api.post).toHaveBeenCalledWith("/api/v1/orders", {
      items: [],
      chefNote: "",
      channel: "ONLINE",
      paymentMethod: "ONLINE_CARD",
    }, { headers: { 'Device-Identifier': 'device-123' } });
  });

  it('maps the delivery address to the backend contract when provided', async () => {
    api.post.mockResolvedValue({ data: { id: 1 } })

    await createOrder({
      items: [],
      chefNote: '',
      channel: 'domicilio',
      paymentMethod: 'ONLINE_CARD',
      address: { street: 'Calle Mayor 1', city: 'Gijón', postalCode: '33001' },
    })

    expect(api.post).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({
      deliveryAddress: {
        deliveryStreet: 'Calle Mayor 1',
        deliveryCity: 'Gijón',
        deliveryPostalCode: '33001',
        deliveryInstructions: null,
      },
    }), expect.anything())
  })

  it('returns the response data as-is', async () => {
    const orderResponse = { id: 42, status: 'PLACED' }
    api.post.mockResolvedValue({ data: orderResponse })

    const result = await createOrder({
      items: [],
      chefNote: '',
      channel: 'sala',
      paymentMethod: 'CASH_ONSITE',
    })

    expect(result).toEqual(orderResponse)
  })

  it('propagates the error when the request fails', async () => {
    api.post.mockRejectedValue(new Error('network error'))

    await expect(
      createOrder({
        items: [],
        chefNote: '',
        channel: 'sala',
        paymentMethod: 'CASH_ONSITE',
      }),
    ).rejects.toThrow('network error')
  })

  it('requests orders filtered by status', async () => {
    const orders = [{ id: 1, status: 'ONTHEWAY' }]
    api.get.mockResolvedValue({ data: orders })

    const result = await getOrdersByStatus('ONTHEWAY')

    expect(api.get).toHaveBeenCalledWith('/api/v1/orders', { params: { status: 'ONTHEWAY' } })
    expect(result).toEqual(orders)
  })

it('sends the table number for a dine-in order when provided', async () => {
  api.post.mockResolvedValue({ data: { id: 1 } })

  await createOrder({
    items: [],
    chefNote: '',
    channel: 'sala',
    paymentMethod: 'CASH_ONSITE',
    tableNumber: 5,
  })

  expect(api.post).toHaveBeenCalledWith(
    '/api/v1/orders',
    expect.objectContaining({ tableNumber: 5 }),
    expect.anything(),
  )
})
})
