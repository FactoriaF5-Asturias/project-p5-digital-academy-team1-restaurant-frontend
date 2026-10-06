import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from './RegisterForm.vue'
import { authService } from '../../services/authService'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

vi.mock('../../services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}))

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the registration form', () => {
    const wrapper = mount(RegisterForm)

    expect(wrapper.find('#firstName').exists()).toBe(true)
    expect(wrapper.find('#lastName').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirm-password').exists()).toBe(true)
    expect(wrapper.find('#address').exists()).toBe(true)
    expect(wrapper.find('#postalCode').exists()).toBe(true)
    expect(wrapper.find('#city').exists()).toBe(true)

    expect(wrapper.text()).toContain('Crear cuenta')
  })

  it('registers the user and redirects to login', async () => {
    authService.register.mockResolvedValue({})

    const wrapper = mount(RegisterForm)

    await wrapper.find('#firstName').setValue('Andrea')
    await wrapper.find('#lastName').setValue('Pérez')
    await wrapper.find('#email').setValue('andrea@test.com')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#confirm-password').setValue('123456')
    await wrapper.find('#address').setValue('Calle Test 1')
    await wrapper.find('#postalCode').setValue('33001')
    await wrapper.find('#city').setValue('Oviedo')

    await wrapper.find('form').trigger('submit')

    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'Andrea',
      lastName: 'Pérez',
      email: 'andrea@test.com',
      password: '123456',
      address: 'Calle Test 1',
      postalCode: '33001',
      city: 'Oviedo',
    })

        expect(pushMock).toHaveBeenCalledWith({ name: 'login', query: { registered: '1' } })
  })

  it('shows an error when passwords do not match', async () => {
    const wrapper = mount(RegisterForm)

    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#confirm-password').setValue('654321')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Las contraseñas no coinciden.')
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('shows an error when registration fails', async () => {
    authService.register.mockRejectedValue({
      response: {
        data: {
          message: 'No se ha podido registrar el usuario',
        },
      },
    })

    const wrapper = mount(RegisterForm)

    await wrapper.find('#firstName').setValue('Andrea')
    await wrapper.find('#lastName').setValue('Pérez')
    await wrapper.find('#email').setValue('andrea@test.com')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#confirm-password').setValue('123456')
    await wrapper.find('#address').setValue('Calle Test 1')
    await wrapper.find('#postalCode').setValue('33001')
    await wrapper.find('#city').setValue('Oviedo')

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('No se ha podido registrar el usuario')
  })
})