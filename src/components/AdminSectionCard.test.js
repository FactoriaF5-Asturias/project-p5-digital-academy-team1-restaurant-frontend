import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminSectionCard from './AdminSectionCard.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :data-to="to.name"><slot /></a>',
}

const AVAILABLE_SECTION = {
  key: 'invoices',
  title: 'Facturación',
  description: 'Pedidos pagados y facturas',
  icon: 'receipt_long',
  routeName: 'admin-facturacion',
  available: true,
}

function mountCard(section) {
  return mount(AdminSectionCard, {
    props: { section },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('AdminSectionCard', () => {
  it('muestra el título y la descripción de la sección', () => {
    const wrapper = mountCard(AVAILABLE_SECTION)

    expect(wrapper.text()).toContain('Facturación')
    expect(wrapper.text()).toContain('Pedidos pagados y facturas')
  })

  it('si está disponible es un enlace a su ruta', () => {
    const link = mountCard(AVAILABLE_SECTION).find('a')

    expect(link.attributes('data-to')).toBe('admin-facturacion')
    expect(link.text()).toContain('Entrar')
  })

  it('si no está disponible no es enlace y dice "Próximamente"', () => {
    const wrapper = mountCard({ ...AVAILABLE_SECTION, routeName: null, available: false })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.text()).toContain('Próximamente')
  })

  it('el icono es decorativo para los lectores de pantalla', () => {
    const icon = mountCard(AVAILABLE_SECTION).find('.admin-section-card__icon')

    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.text()).toBe('receipt_long')
  })
})