import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NavLinks from './NavLinks.vue'
import { NAV_VARIANTS } from '../constants/navigation'

const LINKS = [
  { to: { name: 'carta' }, label: 'Carta' },
  { to: { name: 'cesta' }, label: 'Cesta', showsCartCount: true },
]

async function mountNavLinks(props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'carta', component: { template: '<div />' } },
      { path: '/cesta', name: 'cesta', component: { template: '<div />' } },
    ],
  })
  router.push('/')
  await router.isReady()

  return mount(NavLinks, {
    props: { links: LINKS, ...props },
    global: { plugins: [router] },
  })
}

describe('NavLinks', () => {
  it('pinta un enlace por cada elemento de la lista', async () => {
    const wrapper = await mountNavLinks()

    const labels = wrapper.findAll('a').map((link) => link.text())

    expect(labels).toEqual(['Carta', 'Cesta'])
  })

  it('muestra el contador solo en el enlace que lo indica', async () => {
    const wrapper = await mountNavLinks({ cartCount: 3 })

    const badges = wrapper.findAll('.nav-links__badge')

    expect(badges).toHaveLength(1)
    expect(badges[0].text()).toBe('3')
    expect(wrapper.findAll('a')[1].text()).toContain('3')
  })

  it('no muestra el contador cuando la cesta está vacía', async () => {
    const wrapper = await mountNavLinks({ cartCount: 0 })

    expect(wrapper.find('.nav-links__badge').exists()).toBe(false)
  })

  it('usa el estilo de escritorio por defecto', async () => {
    const wrapper = await mountNavLinks()

    expect(wrapper.find('a').classes()).toContain('nav-links__link--desktop')
  })

  it('usa el estilo móvil cuando se indica', async () => {
    const wrapper = await mountNavLinks({ variant: NAV_VARIANTS.MOBILE })

    expect(wrapper.find('a').classes()).toContain('nav-links__link--mobile')
  })

  it('marca como activo el enlace de la ruta actual', async () => {
    const wrapper = await mountNavLinks()

    expect(wrapper.find('a').classes()).toContain('nav-links__link--active-desktop')
  })

  it('avisa al padre al pulsar un enlace', async () => {
    const wrapper = await mountNavLinks()

    await wrapper.findAll('a')[1].trigger('click')

    expect(wrapper.emitted('navigate')).toHaveLength(1)
  })

  it('solo acepta las variantes definidas', () => {
    const { validator } = NavLinks.props.variant

    expect(validator(NAV_VARIANTS.MOBILE)).toBe(true)
    expect(validator('tablet')).toBe(false)
  })
})