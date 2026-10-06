import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordInput from './PasswordInput.vue'

function mountInput(props = {}) {
  return mount(PasswordInput, { props: { id: 'password', modelValue: '', ...props } })
}

describe('PasswordInput', () => {
  it('oculta la contraseña al principio', () => {
    const wrapper = mountInput()

    expect(wrapper.find('input').attributes('type')).toBe('password')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Mostrar contraseña')
    expect(wrapper.find('button').attributes('aria-pressed')).toBe('false')
  })

  it('muestra y vuelve a ocultar la contraseña al pulsar el ojo', async () => {
    const wrapper = mountInput()
    const toggle = wrapper.find('button')

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(toggle.attributes('aria-label')).toBe('Ocultar contraseña')
    expect(toggle.attributes('aria-pressed')).toBe('true')

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('el botón no envía el formulario', () => {
    expect(mountInput().find('button').attributes('type')).toBe('button')
  })

  it('usa el id y el autocompletado que recibe', () => {
    const input = mountInput({ id: 'confirm-password', autocomplete: 'new-password' }).find('input')

    expect(input.attributes('id')).toBe('confirm-password')
    expect(input.attributes('autocomplete')).toBe('new-password')
  })

  it('actualiza el valor con v-model', async () => {
    const wrapper = mountInput()

    await wrapper.find('input').setValue('secreto')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['secreto'])
  })
})