import { computed, reactive, watch } from 'vue'

const fields = [
  {
    name: 'firstName',
    label: 'Nombre',
    type: 'text',
    autocomplete: 'given-name',
    requiredMessage: 'El nombre es obligatorio.',
  },
  {
    name: 'lastName',
    label: 'Apellidos',
    type: 'text',
    autocomplete: 'family-name',
    requiredMessage: 'Los apellidos son obligatorios.',
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    type: 'email',
    autocomplete: 'email',
    requiredMessage: 'El correo electrónico es obligatorio.',
    fullWidth: true,
  },
  {
    name: 'address',
    label: 'Dirección',
    type: 'text',
    autocomplete: 'street-address',
    requiredMessage: 'La dirección es obligatoria.',
    fullWidth: true,
  },
  {
    name: 'postalCode',
    label: 'Código postal',
    type: 'text',
    autocomplete: 'postal-code',
    requiredMessage: 'El código postal es obligatorio.',
  },
{
  name: 'city',
  label: 'Ciudad',
  type: 'text',
  autocomplete: 'address-level2',
  requiredMessage: 'La ciudad es obligatoria.',
  voiceInput: true,
},
]

export function useProfileForm(getUser) {
  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
  })

  const touched = reactive({})

  function resetForm() {
    const user = getUser()

    fields.forEach(({ name }) => {
      form[name] = user?.[name] ?? ''
      touched[name] = false
    })
  }

  watch(getUser, resetForm, { immediate: true })

  const hasChanges = computed(() => {
    const user = getUser()

    if (!user) return false

    return fields.some(({ name }) => {
      return form[name] !== (user[name] ?? '')
    })
  })

  const errors = computed(() => {
    const result = {}

    fields.forEach(({ name, requiredMessage }) => {
      if (!form[name].trim()) {
        result[name] = requiredMessage
      }
    })

    if (
      !result.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      result.email = 'Introduce un correo electrónico válido.'
    }

    return result
  })

  function validateField(field) {
    touched[field] = true
  }

  function validateForm() {
    fields.forEach(({ name }) => {
      touched[name] = true
    })

    return Object.keys(errors.value).length === 0
  }

  return {
    fields,
    form,
    touched,
    errors,
    hasChanges,
    resetForm,
    validateField,
    validateForm,
  }
}
