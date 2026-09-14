import { describe, it, expect, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Hero from './Hero.vue'

describe('Hero', () => {
  it('renderiza el badge, el título y la descripción', () => {
    const wrapper = mount(Hero, { global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.text()).toContain('Programmed to perfection')
    expect(wrapper.text()).toContain('Sushi con la precisión')
    expect(wrapper.text()).toContain('de un buen commit')
    expect(wrapper.text()).toContain('Pedidos limpios')
  })

  it('renderiza la imagen con un alt descriptivo', () => {
    const wrapper = mount(Hero, { global: { stubs: { RouterLink: RouterLinkStub } } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toContain('GitSushi')
  })

  it('el botón "Ver la carta" hace scroll a la sección de productos', () => {
    const scrollIntoViewMock = vi.fn()
    document.getElementById = vi.fn().mockReturnValue({ scrollIntoView: scrollIntoViewMock })

    const wrapper = mount(Hero, { global: { stubs: { RouterLink: RouterLinkStub } } })
    wrapper.find('button').trigger('click')

    expect(document.getElementById).toHaveBeenCalledWith('productos-carta')
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('el botón "Seguir mi pedido" enlaza a la ruta mi-pedido', () => {
    const wrapper = mount(Hero, { global: { stubs: { RouterLink: RouterLinkStub } } })
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props().to).toEqual({ name: 'mi-pedido' })
    expect(link.text()).toBe('Seguir mi pedido')
  })
})