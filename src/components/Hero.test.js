import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Hero from './Hero.vue'
import { useAuthStore } from '../stores/auth'

function mountHero() {
  setActivePinia(createPinia())
  return mount(Hero, { global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('Hero', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renderiza el badge, el título y la descripción', () => {
    const wrapper = mountHero()
    expect(wrapper.text()).toContain('Programmed to perfection')
    expect(wrapper.text()).toContain('Sushi con la precisión')
    expect(wrapper.text()).toContain('de un buen commit')
    expect(wrapper.text()).toContain('Pedidos limpios')
  })

  it('renderiza la imagen con un alt descriptivo', () => {
    const wrapper = mountHero()
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toContain('GitSushi')
  })

  it('el botón "Ver la carta" hace scroll a la sección de productos', () => {
    const scrollIntoViewMock = vi.fn()
    document.getElementById = vi.fn().mockReturnValue({ scrollIntoView: scrollIntoViewMock })

    const wrapper = mountHero()
    wrapper.find('button').trigger('click')

    expect(document.getElementById).toHaveBeenCalledWith('productos-carta')
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('no muestra el botón "Seguir mi pedido" sin sesión iniciada', () => {
    const wrapper = mountHero()
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('el botón "Seguir mi pedido" enlaza a la ruta mi-pedido cuando entra un cliente', () => {
    const wrapper = mountHero()
    const authStore = useAuthStore()
    authStore.user = { id: 1 }
    authStore.role = 'ROLE_CUSTOMER'

    return wrapper.vm.$nextTick().then(() => {
      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to).toEqual({ name: 'mi-pedido' })
      expect(link.text()).toBe('Seguir mi pedido')
    })
  })

  it.each(['ROLE_ADMIN', 'ROLE_COOK', 'ROLE_DELIVERYMAN'])(
    'no muestra el botón "Seguir mi pedido" con el rol %s',
    async (role) => {
      const wrapper = mountHero()
      const authStore = useAuthStore()
      authStore.user = { id: 1 }
      authStore.role = role
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
    }
  )
})