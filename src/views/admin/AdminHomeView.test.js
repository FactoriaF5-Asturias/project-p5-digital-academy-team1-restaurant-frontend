import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminHomeView from './AdminHomeView.vue'
import { ADMIN_SECTIONS } from '../../constants/adminSections'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :data-to="to.name"><slot /></a>',
}

function mountHome() {
  return mount(AdminHomeView, {
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('AdminHomeView', () => {
  it('muestra el título del panel', () => {
    expect(mountHome().find('h1').text()).toBe('Panel de administración')
  })

  it('muestra una tarjeta por cada sección', () => {
    expect(mountHome().findAll('.admin-home__item')).toHaveLength(ADMIN_SECTIONS.length)
  })

  it('solo las secciones disponibles son enlaces', () => {
    const availableCount = ADMIN_SECTIONS.filter((section) => section.available).length

    expect(mountHome().findAll('a')).toHaveLength(availableCount)
  })
})