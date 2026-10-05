import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserMenu from './UserMenu.vue'

const user = {
  firstName: 'Siquis',
  lastName: 'Miquis',
  email: 'admin@gitsushi.com',
}

let wrapper

function mountMenu() {
  wrapper = mount(UserMenu, {
    props: { user, role: 'ROLE_ADMIN' },
    attachTo: document.body,
  })
  return wrapper
}

function findTrigger() {
  return wrapper.find('button[aria-label="Abrir menú de usuario"]')
}

describe('UserMenu', () => {
  afterEach(() => {
    wrapper.unmount()
  })

  it('al cargar solo muestra el icono, con el menú cerrado', () => {
    mountMenu()

    expect(findTrigger().exists()).toBe(true)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('al pulsar el icono muestra nombre, rol en español y email', async () => {
    mountMenu()

    await findTrigger().trigger('click')

    expect(wrapper.text()).toContain('Siquis Miquis')
    expect(wrapper.text()).toContain('Administrador')
    expect(wrapper.text()).toContain('admin@gitsushi.com')
    expect(findTrigger().attributes('aria-expanded')).toBe('true')
  })

  it('al pulsar "Cerrar sesión" avisa al padre y cierra el menú', async () => {
    mountMenu()
    await findTrigger().trigger('click')

    const logoutButton = wrapper.findAll('button').find((b) => b.text() === 'Cerrar sesión')
    await logoutButton.trigger('click')

    expect(wrapper.emitted('logout')).toHaveLength(1)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('se cierra al hacer clic fuera del menú', async () => {
    mountMenu()
    await findTrigger().trigger('click')

    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('si el usuario no tiene nombre, muestra su email', async () => {
    wrapper = mount(UserMenu, {
      props: { user: { email: 'sin-nombre@gitsushi.com' }, role: 'ROLE_CUSTOMER' },
      attachTo: document.body,
    })

    await findTrigger().trigger('click')

    expect(wrapper.find('.user-identity__name').text()).toBe('sin-nombre@gitsushi.com')
  })
})