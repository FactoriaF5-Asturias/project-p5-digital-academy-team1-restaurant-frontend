import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AccessDeniedView from './AccessDeniedView.vue'

const mockRouter = {
  back: vi.fn(),
  push: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

function mountView() {
  return mount(AccessDeniedView)
}

describe('AccessDeniedView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.history.replaceState(null, '')
  })

  it('muestra el título de acceso denegado', () => {
    const wrapper = mountView()

    expect(wrapper.find('h1').text()).toBe('Acceso denegado')
  })

  it('explica que el usuario no tiene permiso', () => {
    const wrapper = mountView()

    expect(wrapper.text()).toContain('no tiene permiso para ver esta página')
  })

  it('se anuncia como alerta para lectores de pantalla', () => {
    const wrapper = mountView()

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('el botón Regresar vuelve a la vista anterior', async () => {
    window.history.replaceState({ back: '/cocina' }, '')
    const wrapper = mountView()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(button.text()).toBe('Regresar')
    expect(mockRouter.back).toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('si se escribió la URL a mano, Regresar lleva a la carta', async () => {
    const wrapper = mountView()

    await wrapper.find('button').trigger('click')

    expect(mockRouter.back).not.toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'carta' })
  })
})