import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { profileService } from '../../services/profileService'
import ProfileForm from './ProfileForm.vue'

vi.mock('../../services/profileService', () => ({
  profileService: {
    updateProfile: vi.fn(),
  },
}))

const user = {
  id: 'test-user',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  address: 'Calle Mayor 10',
  postalCode: '28001',
  city: 'Madrid',
  roles: ['ROLE_CUSTOMER'],
}

const fields = [
  'firstName',
  'lastName',
  'email',
  'address',
  'postalCode',
  'city',
]

function mountForm({
  currentUser = user,
  loading = false,
  attachTo,
} = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore()
  authStore.user = currentUser ? { ...currentUser } : null
  authStore.role = currentUser?.roles?.[0] ?? null
  authStore.isFetchingUser = loading

  const wrapper = mount(ProfileForm, {
    ...(attachTo ? { attachTo } : {}),
    global: {
      plugins: [pinia],
    },
  })

  return { wrapper, authStore }
}

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('precarga los datos del usuario sin mostrar errores', () => {
    const { wrapper } = mountForm()

    fields.forEach((field) => {
      expect(wrapper.get(`#${field}`).element.value).toBe(user[field])
    })

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
  })

  it('detecta cambios sin modificar los datos del store', async () => {
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#firstName').setValue('Lucía')

    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
    expect(authStore.user.firstName).toBe('Ana')

    await wrapper.get('#firstName').setValue('Ana')

    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
  })

  it.each(fields)(
    'valida %s al salir del campo y rechaza espacios',
    async (field) => {
      const { wrapper } = mountForm()
      const input = wrapper.get(`#${field}`)

      await input.setValue('')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(false)

      await input.trigger('blur')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(true)
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toBe(`${field}-error`)

      await input.setValue('   ')

      expect(wrapper.find(`#${field}-error`).exists()).toBe(true)

      await input.setValue(user[field])

      expect(wrapper.find(`#${field}-error`).exists()).toBe(false)
      expect(input.attributes('aria-invalid')).toBe('false')
      expect(input.attributes('aria-describedby')).toBeUndefined()
    },
  )

  it('rechaza un email sin formato válido', async () => {
    const { wrapper } = mountForm()
    const input = wrapper.get('#email')

    await input.setValue('hola')
    await input.trigger('blur')

    expect(wrapper.get('#email-error').text()).toBe(
      'Introduce un correo electrónico válido.',
    )

    await input.setValue('nuevo@example.com')

    expect(wrapper.find('#email-error').exists()).toBe(false)
  })

  it('descarta los cambios y limpia los errores', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#firstName').setValue('')
    await wrapper.get('#firstName').trigger('blur')
    await wrapper.get('#city').setValue('Barcelona')

    expect(wrapper.find('#firstName-error').exists()).toBe(true)

    await wrapper.get('.profile-form__reset').trigger('click')

    fields.forEach((field) => {
      expect(wrapper.get(`#${field}`).element.value).toBe(user[field])
    })

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
    expect(wrapper.find('.profile-form__reset').exists()).toBe(false)
    expect(profileService.updateProfile).not.toHaveBeenCalled()
  })

  it('habilita el guardado cuando hay cambios válidos', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')

    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(false)
    expect(wrapper.find('#profile-save-help').exists()).toBe(false)
  })

  it('valida todos los campos al enviar y no llama al backend', async () => {
    const { wrapper } = mountForm()

    for (const field of fields) {
      await wrapper.get(`#${field}`).setValue('')
    }

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)

    await wrapper.get('form').trigger('submit')
    await nextTick()

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(6)
    expect(profileService.updateProfile).not.toHaveBeenCalled()
  })

  it('enfoca el primer campo con error al enviar', async () => {
    const { wrapper } = mountForm({
      attachTo: document.body,
    })

    try {
      await wrapper.get('#email').setValue('correo-invalido')
      await wrapper.get('#city').setValue('')

      await wrapper.get('form').trigger('submit')
      await nextTick()

      expect(document.activeElement).toBe(wrapper.get('#email').element)
      expect(profileService.updateProfile).not.toHaveBeenCalled()
    } finally {
      wrapper.unmount()
    }
  })

  it('muestra el estado vacío cuando no hay usuario', () => {
    const { wrapper } = mountForm({
      currentUser: null,
    })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(
      'No hay datos de usuario disponibles.',
    )
  })

  it('muestra carga y oculta el formulario mientras recupera datos', () => {
    const { wrapper } = mountForm({
      loading: true,
    })

    expect(wrapper.text()).toContain('Cargando tus datos…')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('true')
  })

  it('muestra el usuario cuando termina la carga', async () => {
    const { wrapper, authStore } = mountForm({
      currentUser: null,
      loading: true,
    })

    authStore.user = { ...user }
    authStore.isFetchingUser = false

    await nextTick()

    expect(wrapper.text()).not.toContain('Cargando tus datos…')
    expect(wrapper.get('#firstName').element.value).toBe('Ana')
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('false')
  })

  it('muestra el estado vacío si la carga termina sin usuario', async () => {
    const { wrapper, authStore } = mountForm({
      currentUser: null,
      loading: true,
    })

    authStore.isFetchingUser = false

    await nextTick()

    expect(wrapper.text()).not.toContain('Cargando tus datos…')
    expect(wrapper.text()).toContain(
      'No hay datos de usuario disponibles.',
    )
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('oculta el formulario si desaparece el usuario', async () => {
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')

    authStore.user = null

    await nextTick()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
  })

  it('guarda los campos editables y actualiza el store y el formulario', async () => {
    const { wrapper, authStore } = mountForm()

    profileService.updateProfile.mockResolvedValue({
      ...user,
      city: 'Barcelona',
    })

    await wrapper.get('#city').setValue('  Barcelona  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(profileService.updateProfile).toHaveBeenCalledWith(
      user.id,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        postalCode: user.postalCode,
        city: 'Barcelona',
      },
    )

    expect(authStore.user.city).toBe('Barcelona')
    expect(authStore.role).toBe('ROLE_CUSTOMER')
    expect(wrapper.get('#city').element.value).toBe('Barcelona')
    expect(wrapper.text()).toContain('Perfil actualizado correctamente.')
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
  })

  it('actualiza el email del store después de guardar', async () => {
    const { wrapper, authStore } = mountForm()

    profileService.updateProfile.mockResolvedValue({
      ...user,
      email: 'nuevo@example.com',
    })

    await wrapper.get('#email').setValue('nuevo@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authStore.user.email).toBe('nuevo@example.com')
    expect(wrapper.get('#email').element.value).toBe('nuevo@example.com')
    expect(wrapper.text()).toContain('Perfil actualizado correctamente.')
  })

  it('conserva los cambios y el store si el correo está en uso', async () => {
    const { wrapper, authStore } = mountForm()

    profileService.updateProfile.mockRejectedValue({
      response: { status: 409 },
    })

    await wrapper.get('#email').setValue('ocupado@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Ese correo ya está en uso',
    )

    expect(authStore.user.email).toBe(user.email)
    expect(wrapper.get('#email').element.value).toBe('ocupado@example.com')
    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(false)
    expect(wrapper.text()).not.toContain('Perfil actualizado correctamente.')
  })

  it('permite reintentar el guardado después de un error de red', async () => {
    const { wrapper, authStore } = mountForm()

    profileService.updateProfile
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ...user,
        city: 'Barcelona',
      })

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No se pudo guardar el perfil',
    )
    expect(authStore.user.city).toBe('Madrid')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(false)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(profileService.updateProfile).toHaveBeenCalledTimes(2)
    expect(authStore.user.city).toBe('Barcelona')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Perfil actualizado correctamente.')
  })

  it('evita envíos duplicados y bloquea los campos mientras guarda', async () => {
    let resolveSave

    profileService.updateProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )

    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(profileService.updateProfile).toHaveBeenCalledTimes(1)
    expect(wrapper.get('fieldset').element.disabled).toBe(true)
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
    expect(wrapper.get('.profile-form__reset').element.disabled).toBe(true)
    expect(wrapper.get('.profile-form__submit').text()).toBe('Guardando…')
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('true')

    resolveSave({
      ...user,
      city: 'Barcelona',
    })

    await flushPromises()

    expect(wrapper.get('fieldset').element.disabled).toBe(false)
    expect(wrapper.get('.profile-form').attributes('aria-busy')).toBe('false')
    expect(wrapper.text()).toContain('Perfil actualizado correctamente.')
  })

  it('no llama al backend si no hay cambios', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('form').trigger('submit')

    expect(profileService.updateProfile).not.toHaveBeenCalled()
  })
})