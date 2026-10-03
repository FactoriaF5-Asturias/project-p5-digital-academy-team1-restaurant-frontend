// src/components/ProductCard.test.js
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from './ProductCard.vue'

const product = {
  id: 1,
  name: 'Dragon Roll',
  description: 'Tempura de langostino.',
  price: 12.5,
  imageUrl: 'https://placehold.co/300x200',
}

describe('ProductCard', () => {
  it('renders the name, description and formatted price', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.text()).toContain('Dragon Roll')
    expect(wrapper.text()).toContain('Tempura de langostino.')
    expect(wrapper.text()).toContain('12,50')
  })

  it('starts with quantity 1 and does not go below 1', async () => {
    const wrapper = mount(ProductCard, { props: { product } })
    const decreaseBtn = wrapper.find('[aria-label="Reducir cantidad"]')

    expect(wrapper.find('.product-card__quantity-value').text()).toBe('1')

    await decreaseBtn.trigger('click')
    expect(wrapper.find('.product-card__quantity-value').text()).toBe('1')
  })

  it('increases the quantity when the + button is clicked', async () => {
    const wrapper = mount(ProductCard, { props: { product } })
    const increaseBtn = wrapper.find('[aria-label="Aumentar cantidad"]')

    await increaseBtn.trigger('click')

    expect(wrapper.find('.product-card__quantity-value').text()).toBe('2')
  })

  it('emits add-to-cart with the product and the chosen quantity', async () => {
    const wrapper = mount(ProductCard, { props: { product } })
    await wrapper.find('[aria-label="Aumentar cantidad"]').trigger('click')
    await wrapper.find('.product-card__add-btn').trigger('click')

    expect(wrapper.emitted('add-to-cart')).toHaveLength(1)
    expect(wrapper.emitted('add-to-cart')[0][0]).toEqual({ product, quantity: 2 })
  })

  it('resets the quantity to 1 after adding to the cart', async () => {
    const wrapper = mount(ProductCard, { props: { product } })
    await wrapper.find('[aria-label="Aumentar cantidad"]').trigger('click')
    await wrapper.find('.product-card__add-btn').trigger('click')

    expect(wrapper.find('.product-card__quantity-value').text()).toBe('1')
  })

  it('decreases the quantity when above 1', async () => {
  const wrapper = mount(ProductCard, { props: { product } })
  await wrapper.find('[aria-label="Aumentar cantidad"]').trigger('click')
  await wrapper.find('[aria-label="Reducir cantidad"]').trigger('click')

  expect(wrapper.find('.product-card__quantity-value').text()).toBe('1')
})

it('shows a confirmation on the button after adding to the cart', async () => {
  const wrapper = mount(ProductCard, { props: { product } })
  await wrapper.find('.product-card__add-btn').trigger('click')

  const addBtn = wrapper.find('.product-card__add-btn')
  expect(addBtn.text()).toBe('Añadido ✓')
  expect(addBtn.attributes('disabled')).toBeDefined()
})

it('reverts the add button after the feedback delay', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const wrapper = mount(ProductCard, { props: { product } })
  await wrapper.find('.product-card__add-btn').trigger('click')

  await vi.advanceTimersByTimeAsync(1500)

  const addBtn = wrapper.find('.product-card__add-btn')
  expect(addBtn.text()).toBe('Añadir')
  expect(addBtn.attributes('disabled')).toBeUndefined()

  vi.useRealTimers()
})

it('resolves a bare filename from the backend to the public products path', () => {
  const realProduct = { ...product, imageUrl: 'hello-edamame.png' }
  const wrapper = mount(ProductCard, { props: { product: realProduct } })

  expect(wrapper.find('.product-card__image').attributes('src')).toBe('/products/hello-edamame.png')
})

it('uses a full URL as-is when the backend already sends one', () => {
  const wrapper = mount(ProductCard, { props: { product } })

  expect(wrapper.find('.product-card__image').attributes('src')).toBe('https://placehold.co/300x200')
})
})

describe('ProductCard in read-only mode', () => {
  it('shows the photo, name, description and price', () => {
    const wrapper = mount(ProductCard, { props: { product, readonly: true } })

    expect(wrapper.find('.product-card__image').exists()).toBe(true)
    expect(wrapper.text()).toContain('Dragon Roll')
    expect(wrapper.text()).toContain('Tempura de langostino.')
    expect(wrapper.text()).toContain('12,50')
  })

  it('does not show the quantity selector nor the add button', () => {
    const wrapper = mount(ProductCard, { props: { product, readonly: true } })

    expect(wrapper.find('.product-card__footer').exists()).toBe(false)
    expect(wrapper.find('.product-card__quantity').exists()).toBe(false)
    expect(wrapper.find('.product-card__add-btn').exists()).toBe(false)
  })

  it('shows the quantity selector and the add button by default', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.find('.product-card__quantity').exists()).toBe(true)
    expect(wrapper.find('.product-card__add-btn').exists()).toBe(true)
  })
})