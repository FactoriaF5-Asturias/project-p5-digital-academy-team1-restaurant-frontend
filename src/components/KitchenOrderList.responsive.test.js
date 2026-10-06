import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenOrderList from './KitchenOrderList.vue'

const orders = [
  { id: 1, channel: 'IN_STORE', products: [{ name: 'Pull Nigiri', quantity: 2 }] },
  { id: 2, channel: 'DELIVERY', products: [{ name: 'Commit Roll', quantity: 1 }] },
]

describe('KitchenOrderList - pantallas', () => {
  it('muestra las comandas en 1 columna en móvil, 2 en tablet y 4 en escritorio', () => {
    const wrapper = mount(KitchenOrderList, { props: { orders } })

    const grid = wrapper.find('.grid')

    expect(grid.classes()).toEqual(
      expect.arrayContaining(['grid', 'md:grid-cols-2', 'xl:grid-cols-4'])
    )
    expect(grid.findAll('article')).toHaveLength(2)
  })

  it('en móvil no fija columnas (una sola columna por defecto)', () => {
    const wrapper = mount(KitchenOrderList, { props: { orders } })

    const baseColumns = wrapper
      .find('.grid')
      .classes()
      .filter((className) => className.startsWith('grid-cols-'))

    expect(baseColumns).toEqual([])
  })
})