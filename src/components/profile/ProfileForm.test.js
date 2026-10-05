import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import ProfileForm from './ProfileForm.vue'

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
  it('precarga los datos del usuario sin mostrar errores', () => {
    const { wrapper } = mountForm()

    fields.forEach((field) => {
      expect(wrapper.get(`#${field}`).element.value).toBe(user[field])
    })

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Tienes cambios sin guardar.')
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
    }
  )

  it('rechaza un email sin formato válido', async () => {
    const { wrapper } = mountForm()
    const input = wrapper.get('#email')

    await input.setValue('hola')
    await input.trigger('blur')

    expect(wrapper.get('#email-error').text()).toBe(
      'Introduce un correo electrónico válido.'
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
  })

  it('mantiene el guardado deshabilitado aunque haya cambios válidos', async () => {
    const { wrapper } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')

    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
    expect(wrapper.get('#profile-save-help').text()).toContain(
      'El guardado de cambios estará disponible próximamente.'
    )
  })

  it('valida todos los campos al enviar el formulario', async () => {
    const { wrapper } = mountForm()

    for (const field of fields) {
      await wrapper.get(`#${field}`).setValue('')
    }

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)

    await wrapper.get('form').trigger('submit')
    await nextTick()

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(6)
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

      expect(document.activeElement).toBe(
        wrapper.get('#email').element
      )
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
      'No hay datos de usuario disponibles.'
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
      'No hay datos de usuario disponibles.'
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

  it('no actualiza el store ni simula un guardado al enviar datos válidos', async () => {
    const { wrapper, authStore } = mountForm()

    await wrapper.get('#city').setValue('Barcelona')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.findAll('.profile-form__error')).toHaveLength(0)
    expect(authStore.user.city).toBe('Madrid')
    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
    expect(wrapper.get('.profile-form__submit').element.disabled).toBe(true)
  })
})