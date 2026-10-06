import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductImage from './ProductImage.vue'

const PHOTO_URL = '/products/hello-edamame.png'
const ALT_TEXT = 'Foto de Hello Edamame'

function mountImage(props = {}) {
  return mount(ProductImage, {
    props: { src: PHOTO_URL, alt: ALT_TEXT, ...props },
  })
}

describe('ProductImage', () => {
  it('muestra la foto del producto con su texto alternativo', () => {
    const wrapper = mountImage()

    const image = wrapper.find('img')

    expect(image.attributes('src')).toBe(PHOTO_URL)
    expect(image.attributes('alt')).toBe(ALT_TEXT)
    expect(image.attributes('loading')).toBe('lazy')
  })

  it('muestra "Foto no disponible" si el producto no tiene foto', () => {
    const wrapper = mountImage({ src: '' })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Foto no disponible')
  })

  it('cambia a "Foto no disponible" si la foto no se puede cargar', async () => {
    const wrapper = mountImage()

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.product-image--placeholder').exists()).toBe(true)
  })

  it('el aviso se lee como imagen e indica qué producto es', () => {
    const wrapper = mountImage({ src: '' })

    const placeholder = wrapper.find('.product-image--placeholder')

    expect(placeholder.attributes('role')).toBe('img')
    expect(placeholder.attributes('aria-label')).toBe(`${ALT_TEXT}: foto no disponible`)
  })

  it('el icono es decorativo y los lectores de pantalla lo ignoran', () => {
    const wrapper = mountImage({ src: '' })

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('vuelve a intentar cargar cuando cambia la foto', async () => {
    const wrapper = mountImage()

    await wrapper.find('img').trigger('error')
    await wrapper.setProps({ src: '/products/ctrl-takoyaki.png' })

    expect(wrapper.find('img').attributes('src')).toBe('/products/ctrl-takoyaki.png')
  })

  it('acepta clases del padre para el tamaño (p. ej. en ProductCard)', () => {
    const wrapper = mount(ProductImage, {
      props: { src: '', alt: ALT_TEXT },
      attrs: { class: 'product-card__image' },
    })

    expect(wrapper.classes()).toContain('product-card__image')
  })
})