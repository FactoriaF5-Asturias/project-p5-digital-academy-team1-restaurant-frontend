import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KitchenOrderList from './KitchenOrderList.vue'

describe('KitchenOrderList', () => {
  it('shows the loading state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        isLoading: true
      }
    })

    expect(wrapper.text()).toContain('Cargando comandas...')
  })

  it('shows the error state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        error: 'Error al cargar las comandas'
      }
    })

    expect(wrapper.text()).toContain('Error al cargar las comandas')
  })

  it('shows the empty state', () => {
    const wrapper = mount(KitchenOrderList, {
      props: {
        orders: []
      }
    })

    expect(wrapper.text()).toContain('No hay comandas activas.')
  })
  const orders = [
  {
    id: 1042,
    elapsedTime: 16,
    status: 'PROCESSING',
    channel: 'IN_STORE',
    products: [
      {
        name: 'Pull Nigiri',
        quantity: 2
      }
    ]
  },
  {
    id: 1043,
    elapsedTime: 11,
    status: 'PROCESSING',
    channel: 'DELIVERY',
    products: [
      {
        name: 'Commit Roll',
        quantity: 3
      }
    ]
  }
]

it('shows all orders by default', () => {
  const wrapper = mount(KitchenOrderList, {
    props: {
      orders
    }
  })

  expect(wrapper.text()).toContain('#1042')
  expect(wrapper.text()).toContain('#1043')
})

it('filters orders by in store channel', async () => {
  const wrapper = mount(KitchenOrderList, {
    props: {
      orders
    }
  })

  const buttons = wrapper.findAll('button')

  await buttons[1].trigger('click')

  expect(wrapper.text()).toContain('#1042')
  expect(wrapper.text()).not.toContain('#1043')
})

it('filters orders by delivery channel', async () => {
  const wrapper = mount(KitchenOrderList, {
    props: {
      orders
    }
  })

  const buttons = wrapper.findAll('button')

  await buttons[2].trigger('click')

  expect(wrapper.text()).not.toContain('#1042')
  expect(wrapper.text()).toContain('#1043')
})

it('shows all orders again when all filter is selected', async () => {
  const wrapper = mount(KitchenOrderList, {
    props: {
      orders
    }
  })

  const buttons = wrapper.findAll('button')

  await buttons[2].trigger('click')
  await buttons[0].trigger('click')

  expect(wrapper.text()).toContain('#1042')
  expect(wrapper.text()).toContain('#1043')
})

it('keeps the selected filter visually active', async () => {
  const wrapper = mount(KitchenOrderList, {
    props: {
      orders
    }
  })

  const buttons = wrapper.findAll('button')

  await buttons[2].trigger('click')

  expect(buttons[2].classes()).toContain('btn-primary')
  expect(buttons[0].classes()).toContain('btn-secondary')
})
})