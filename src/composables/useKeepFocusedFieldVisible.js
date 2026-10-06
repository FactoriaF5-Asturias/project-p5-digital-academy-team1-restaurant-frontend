import { onMounted, onUnmounted } from 'vue'

// Responsabilidad: en pantallas táctiles, cuando aparece el teclado,
// desplazar el campo con foco al centro para que el teclado no lo tape.

// Campos que abren el teclado (checkbox, radio y botones no lo abren).
const TYPING_FIELD_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea'
const TOUCH_SCREEN_QUERY = '(pointer: coarse)'
// Tiempo aproximado que tarda el teclado en terminar de abrirse.
const KEYBOARD_OPEN_DELAY_MS = 300

export function isTypingField(element) {
  return element instanceof Element && element.matches(TYPING_FIELD_SELECTOR)
}

function isTouchScreen() {
  return window.matchMedia?.(TOUCH_SCREEN_QUERY).matches ?? false
}

export function useKeepFocusedFieldVisible() {
  let timeoutId = null

  function scrollFocusedFieldIntoView() {
    const focusedElement = document.activeElement
    if (!isTypingField(focusedElement)) return

    focusedElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  function scheduleScroll() {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(scrollFocusedFieldIntoView, KEYBOARD_OPEN_DELAY_MS)
  }

  function handleFocusIn(event) {
    if (isTypingField(event.target)) scheduleScroll()
  }

  onMounted(() => {
    // En escritorio no hay teclado en pantalla: no movemos la página.
    if (!isTouchScreen()) return

    document.addEventListener('focusin', handleFocusIn)
    window.visualViewport?.addEventListener('resize', scheduleScroll)
  })

  onUnmounted(() => {
    clearTimeout(timeoutId)
    document.removeEventListener('focusin', handleFocusIn)
    window.visualViewport?.removeEventListener('resize', scheduleScroll)
  })
}