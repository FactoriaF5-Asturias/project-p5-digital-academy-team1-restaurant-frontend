import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VoiceDictationButton from './VoiceDictationButton.vue'

const audioLevelMock = vi.hoisted(() => ({
  startMeter: vi.fn(),
  stopMeter: vi.fn(),
}))

vi.mock('../composables/useAudioLevel', async () => {
  const { ref } = await import('vue')
  return {
    useAudioLevel: () => ({
      levels: ref([0, 0, 0, 0, 0]),
      startMeter: audioLevelMock.startMeter,
      stopMeter: audioLevelMock.stopMeter,
    }),
  }
})

class FakeSpeechRecognition {
  constructor() {
    this.start = vi.fn()
    this.stop = vi.fn()
    FakeSpeechRecognition.lastInstance = this
  }
}

function mountButton() {
  return mount(VoiceDictationButton, { props: { fieldLabel: 'Ciudad' } })
}

function findMicButton(wrapper) {
  return wrapper.find('.voice-dictation__mic')
}

async function startDictation(wrapper) {
  await findMicButton(wrapper).trigger('click')
  return FakeSpeechRecognition.lastInstance
}

describe('VoiceDictationButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.SpeechRecognition = FakeSpeechRecognition
  })

  afterEach(() => {
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
  })

  it('estado inicial: muestra el botón "Dictar ciudad por voz" y la instrucción', () => {
    const wrapper = mountButton()

    expect(findMicButton(wrapper).attributes('aria-label')).toBe('Dictar ciudad por voz')
    expect(findMicButton(wrapper).attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Pulsa el micrófono para dictar')
  })

  it('navegador sin soporte: deshabilita el botón y avisa de que se escriba a mano', () => {
    delete window.SpeechRecognition
    const wrapper = mountButton()

    expect(findMicButton(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Tu navegador no permite el dictado por voz')
  })

  it('carga: al pulsar el micrófono muestra que está escuchando y la onda de audio', async () => {
    const wrapper = mountButton()

    await startDictation(wrapper)

    expect(findMicButton(wrapper).attributes('aria-label')).toBe('Terminar dictado')
    expect(findMicButton(wrapper).attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('Escuchando')
    expect(wrapper.findAll('.voice-dictation__bar')).toHaveLength(5)
    expect(audioLevelMock.startMeter).toHaveBeenCalled()
  })

  it('dictado correcto: emite el texto reconocido', async () => {
    const wrapper = mountButton()
    const recognition = await startDictation(wrapper)

    recognition.onresult({ results: [[{ transcript: 'Avilés' }]] })

    expect(wrapper.emitted('transcript')[0]).toEqual(['Avilés'])
  })

  it('al pulsar otra vez mientras escucha, termina el dictado', async () => {
    const wrapper = mountButton()
    const recognition = await startDictation(wrapper)

    await findMicButton(wrapper).trigger('click')

    expect(recognition.stop).toHaveBeenCalled()
  })

  it('al terminar el reconocimiento para la onda de audio', async () => {
    const wrapper = mountButton()
    const recognition = await startDictation(wrapper)

    recognition.onend()
    await wrapper.vm.$nextTick()

    expect(audioLevelMock.stopMeter).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Pulsa el micrófono para dictar')
  })

  it('error: avisa si no entiende el audio y no emite ningún texto', async () => {
    const wrapper = mountButton()
    const recognition = await startDictation(wrapper)

    recognition.onerror({ error: 'no-speech' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alert"]').text()).toContain('No se ha entendido el audio')
    expect(wrapper.emitted('transcript')).toBeUndefined()
  })

  it('error: avisa de que el micrófono está bloqueado si se deniega el permiso', async () => {
    const wrapper = mountButton()
    const recognition = await startDictation(wrapper)

    recognition.onerror({ error: 'not-allowed' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alert"]').text()).toContain('Has bloqueado el micrófono')
  })
})