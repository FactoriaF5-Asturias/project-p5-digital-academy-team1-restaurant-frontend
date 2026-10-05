import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import ProfileForm from './ProfileForm.vue'

vi.mock('../../composables/useAudioLevel', async () => {
  const { ref } = await import('vue')
  return {
    useAudioLevel: () => ({ levels: ref([0, 0, 0, 0, 0]), startMeter: vi.fn(), stopMeter: vi.fn() }),
  }
})

class FakeSpeechRecognition {
  constructor() {
    this.start = vi.fn()
    this.stop = vi.fn()
    FakeSpeechRecognition.lastInstance = this
  }
}

const user = {
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  address: 'Calle Mayor 10',
  postalCode: '28001',
  city: 'Madrid',
}

function mountForm() {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().user = { ...user }
  return mount(ProfileForm, { global: { plugins: [pinia] } })
}

async function dictate(wrapper) {
  await wrapper.find('button[aria-label="Dictar ciudad por voz"]').trigger('click')
  return FakeSpeechRecognition.lastInstance
}

describe('ProfileForm - dictado por voz de la ciudad', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.SpeechRecognition = FakeSpeechRecognition
  })

  afterEach(() => {
    delete window.SpeechRecognition
  })

  it('muestra el botón de dictado solo en el campo Ciudad', () => {
    const wrapper = mountForm()

    expect(wrapper.findAll('.voice-dictation__mic')).toHaveLength(1)
    expect(wrapper.find('button[aria-label="Dictar ciudad por voz"]').exists()).toBe(true)
  })

  it('dictado correcto: rellena la ciudad con el texto reconocido y marca cambios', async () => {
    const wrapper = mountForm()
    const recognition = await dictate(wrapper)

    recognition.onresult({ results: [[{ transcript: 'Avilés' }]] })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('#city').element.value).toBe('Avilés')
    expect(wrapper.text()).toContain('Tienes cambios sin guardar.')
  })

  it('error: no borra la ciudad que ya estaba escrita', async () => {
    const wrapper = mountForm()
    await wrapper.get('#city').setValue('Gijón')
    const recognition = await dictate(wrapper)

    recognition.onerror({ error: 'no-speech' })
    await wrapper.vm.$nextTick()

    expect(wrapper.get('#city').element.value).toBe('Gijón')
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it('navegador sin soporte: se puede seguir escribiendo la ciudad a mano', async () => {
    delete window.SpeechRecognition
    const wrapper = mountForm()

    await wrapper.get('#city').setValue('Oviedo')

    expect(wrapper.find('button[aria-label="Dictar ciudad por voz"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#city').element.value).toBe('Oviedo')
  })
})