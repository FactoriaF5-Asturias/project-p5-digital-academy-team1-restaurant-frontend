import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RegisterForm from './RegisterForm.vue'
import { useAuthStore } from '../../stores/auth'
import { authService } from '../../services/authService'

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('../../services/authService', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

const validForm = {
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  password: 'Password123!',
  'confirm-password': 'Password123!',
  address: 'Calle Mayor 10',
  postalCode: '28001',
  city: 'Madrid',
}

const registeredUser = {
  id: 'user-1',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  roles: ['ROLE_CUSTOMER'],
}

let wrappers = []

function mountForm(options = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(RegisterForm, {
    ...options,
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
  })

  wrappers.push(wrapper)

  return {
    wrapper,
    authStore: useAuthStore(),
  }
}

async function fillForm(wrapper, values = validForm) {
  for (const [id, value] of Object.entries(values)) {
    await wrapper.get(`#${id}`).setValue(value)
  }
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()

    push.mockResolvedValue(undefined)
    authService.register.mockResolvedValue(registeredUser)
    authService.login.mockResolvedValue(registeredUser)
  })

  afterEach(() => {
    wrappers.forEach((wrapper) => wrapper.unmount())
    wrappers = []
  })

  it('renders all fields without initial errors', () => {
    const { wrapper } = mountForm()

    Object.keys(validForm).forEach((id) => {
      expect(wrapper.get(`#${id}`).element.value).toBe('')
    })

    expect(wrapper.findAll('[role="alert"]')).toHaveLength(0)
  })

  it('shows an error for every empty field on submit', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('[role="alert"]')).toHaveLength(8)
    expect(authService.register).not.toHaveBeenCalled()
    expect(authService.login).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it.each([
    'firstName',
    'lastName',
    'email',
    'address',
    'postalCode',
    'city',
  ])('rejects spaces in %s on blur', async (id) => {
    const { wrapper } = mountForm()
    const input = wrapper.get(`#${id}`)

    await input.setValue('   ')
    await input.trigger('blur')

    expect(wrapper.find(`#${id}-error`).exists()).toBe(true)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(`${id}-error`)
  })

  it('validates email format on blur and clears the error when corrected', async () => {
    const { wrapper } = mountForm()
    const input = wrapper.get('#email')

    await input.setValue('correo-invalido')

    expect(wrapper.find('#email-error').exists()).toBe(false)

    await input.trigger('blur')

    expect(wrapper.get('#email-error').text()).toBe(
      'Introduce un correo electrónico válido.',
    )

    await input.setValue('ana@example.com')

    expect(wrapper.find('#email-error').exists()).toBe(false)
    expect(input.attributes('aria-invalid')).toBe('false')
  })

  it('rejects mismatched passwords', async () => {
    const { wrapper } = mountForm()

    await fillForm(wrapper, {
      ...validForm,
      'confirm-password': 'DifferentPassword123!',
    })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#confirm-password-error').text()).toBe(
      'Las contraseñas no coinciden.',
    )
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('focuses the password input when it is the first invalid field', async () => {
    const { wrapper } = mountForm({ attachTo: document.body })

    await fillForm(wrapper, {
      ...validForm,
      password: '',
      'confirm-password': '',
    })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(document.activeElement).toBe(
      wrapper.get('#password').element,
    )
    expect(wrapper.get('#password').attributes('aria-invalid')).toBe(
      'true',
    )
  })

  it('creates the account, authenticates and opens the profile', async () => {
    const { wrapper, authStore } = mountForm()

    await fillForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      password: 'Password123!',
      address: 'Calle Mayor 10',
      postalCode: '28001',
      city: 'Madrid',
    })

    expect(authService.login).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'Password123!',
    })
    expect(authStore.user).toEqual(registeredUser)
    expect(push).toHaveBeenCalledWith('/perfil')
  })

  it('trims personal data while preserving the password', async () => {
    const { wrapper } = mountForm()

    await fillForm(wrapper, {
      firstName: ' Ana ',
      lastName: ' Pérez ',
      email: ' ana@example.com ',
      password: ' Password123! ',
      'confirm-password': ' Password123! ',
      address: ' Calle Mayor 10 ',
      postalCode: ' 28001 ',
      city: ' Madrid ',
    })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Pérez',
      email: 'ana@example.com',
      password: ' Password123! ',
      address: 'Calle Mayor 10',
      postalCode: '28001',
      city: 'Madrid',
    })
  })

  it('blocks duplicate submissions while registering', async () => {
    let resolveRequest

    authService.register.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )

    const { wrapper } = mountForm()
    await fillForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(authService.register).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button[type="submit"]').element.disabled).toBe(
      true,
    )
    expect(wrapper.get('fieldset').element.disabled).toBe(true)
    expect(wrapper.text()).toContain('Creando cuenta...')

    resolveRequest(registeredUser)
    await flushPromises()

    expect(wrapper.get('button[type="submit"]').element.disabled).toBe(
      false,
    )
  })

  it('shows an error when the email already exists', async () => {
    authService.register.mockRejectedValue({
      response: { status: 409 },
    })

    const { wrapper } = mountForm()
    await fillForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'Ya existe una cuenta con este email.',
    )
    expect(authService.login).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('shows an error and preserves the form when registration fails', async () => {
    authService.register.mockRejectedValue(new Error('Network error'))

    const { wrapper } = mountForm()
    await fillForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No se ha podido crear la cuenta. Inténtalo de nuevo.',
    )
    expect(wrapper.get('#email').element.value).toBe('ana@example.com')
    expect(wrapper.get('button[type="submit"]').element.disabled).toBe(
      false,
    )
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('opens login with account confirmation if automatic login fails', async () => {
    authService.login.mockRejectedValue(new Error('Network error'))

    const { wrapper } = mountForm()
    await fillForm(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authService.register).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({
      name: 'login',
      query: { registered: '1' },
    })
    expect(push).not.toHaveBeenCalledWith('/perfil')
  })
})