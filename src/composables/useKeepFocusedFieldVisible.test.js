import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  isTypingField,
  useKeepFocusedFieldVisible,
} from './useKeepFocusedFieldVisible'

const KEYBOARD_OPEN_DELAY_MS = 300

// Componente mínimo que usa el composable y tiene campos de formulario.
const FormWithFields = {
  setup() {
    useKeepFocusedFieldVisible()
  },
  template: `
    <form>
      <input id="city" type="text" />
      <input id="terms" type="checkbox" />
      <textarea id="notes"></textarea>
    </form>
  `,
}

function mockScreen({ isTouch }) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: isTouch })
}

function mountForm() {
  return mount(FormWithFields, { attachTo: document.body })
}

function focusField(wrapper, selector) {
  const field = wrapper.find(selector).element
  field.scrollIntoView = vi.fn()
  field.focus()
  return field
}

describe('useKeepFocusedFieldVisible', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    delete window.matchMedia
  })

  describe('isTypingField', () => {
    it('reconoce los campos que abren el teclado', () => {
      const input = document.createElement('input')
      const textarea = document.createElement('textarea')

      expect(isTypingField(input)).toBe(true)
      expect(isTypingField(textarea)).toBe(true)
    })

    it('ignora checkbox, botones y elementos que no son campos', () => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'

      expect(isTypingField(checkbox)).toBe(false)
      expect(isTypingField(document.createElement('button'))).toBe(false)
      expect(isTypingField(null)).toBe(false)
    })
  })

  it('en pantalla táctil desplaza el campo con foco al centro cuando se abre el teclado', () => {
    mockScreen({ isTouch: true })
    wrapper = mountForm()

    const city = focusField(wrapper, '#city')
    vi.advanceTimersByTime(KEYBOARD_OPEN_DELAY_MS)

    expect(city.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
  })

  it('espera a que el teclado termine de abrirse antes de desplazar', () => {
    mockScreen({ isTouch: true })
    wrapper = mountForm()

    const notes = focusField(wrapper, '#notes')
    vi.advanceTimersByTime(KEYBOARD_OPEN_DELAY_MS - 1)

    expect(notes.scrollIntoView).not.toHaveBeenCalled()
  })

  it('no desplaza al enfocar un checkbox (no abre el teclado)', () => {
    mockScreen({ isTouch: true })
    wrapper = mountForm()

    const terms = focusField(wrapper, '#terms')
    vi.advanceTimersByTime(KEYBOARD_OPEN_DELAY_MS)

    expect(terms.scrollIntoView).not.toHaveBeenCalled()
  })

  it('en escritorio no mueve la página', () => {
    mockScreen({ isTouch: false })
    wrapper = mountForm()

    const city = focusField(wrapper, '#city')
    vi.advanceTimersByTime(KEYBOARD_OPEN_DELAY_MS)

    expect(city.scrollIntoView).not.toHaveBeenCalled()
  })

  it('deja de escuchar al desmontarse', () => {
    mockScreen({ isTouch: true })
    wrapper = mountForm()
    const city = wrapper.find('#city').element
    city.scrollIntoView = vi.fn()

    wrapper.unmount()
    wrapper = null
    city.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    vi.advanceTimersByTime(KEYBOARD_OPEN_DELAY_MS)

    expect(city.scrollIntoView).not.toHaveBeenCalled()
  })
})