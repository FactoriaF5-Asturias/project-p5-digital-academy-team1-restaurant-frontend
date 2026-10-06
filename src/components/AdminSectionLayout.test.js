import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminSectionLayout from './AdminSectionLayout.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :data-to="to.name"><slot /></a>',
}

function mountLayout() {
  return mount(AdminSectionLayout, {
    props: { title: 'Facturación' },
    slots: { default: '<p class="section-content">Contenido</p>' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('AdminSectionLayout', () => {
  it('muestra la ruta de migas con la sección actual marcada', () => {
    const breadcrumb = mountLayout().find('nav[aria-label="Ruta de navegación"]')

    expect(breadcrumb.text()).toContain('Admin')
    expect(breadcrumb.find('[aria-current="page"]').text()).toBe('Facturación')
  })

  it('tiene un enlace para volver al inicio del panel', () => {
    const backLink = mountLayout().find('.admin-section__back')

    expect(backLink.text()).toContain('Volver al panel')
    expect(backLink.attributes('data-to')).toBe('admin')
  })

  it('pinta el contenido de la sección', () => {
    expect(mountLayout().find('.section-content').exists()).toBe(true)
  })
})