import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSpeechRecognition } from './useSpeechRecognition'

class FakeSpeechRecognition {
  constructor() {
    this.start = vi.fn()
    this.stop = vi.fn()
    FakeSpeechRecognition.lastInstance = this
  }
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
  })

  it('indica que no está soportado si el navegador no tiene Web Speech API', () => {
    const { isSupported } = useSpeechRecognition()

    expect(isSupported).toBe(false)
  })

  it('indica que está soportado en navegadores con webkitSpeechRecognition (Chrome)', () => {
    window.webkitSpeechRecognition = FakeSpeechRecognition

    const { isSupported } = useSpeechRecognition()

    expect(isSupported).toBe(true)
  })

  it('al empezar, escucha en español y marca que está escuchando', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, isListening } = useSpeechRecognition()

    start(vi.fn())

    const recognition = FakeSpeechRecognition.lastInstance
    expect(recognition.lang).toBe('es-ES')
    expect(recognition.start).toHaveBeenCalled()
    expect(isListening.value).toBe(true)
  })

  it('dictado correcto: devuelve el texto reconocido a la función que recibe', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const onResult = vi.fn()
    const { start } = useSpeechRecognition()

    start(onResult)
    FakeSpeechRecognition.lastInstance.onresult({ results: [[{ transcript: 'Avilés' }]] })

    expect(onResult).toHaveBeenCalledWith('Avilés')
  })

  it('error: guarda el código de error si no entiende el audio', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, errorCode, isPermissionDenied } = useSpeechRecognition()

    start(vi.fn())
    FakeSpeechRecognition.lastInstance.onerror({ error: 'no-speech' })

    expect(errorCode.value).toBe('no-speech')
    expect(isPermissionDenied.value).toBe(false)
  })

  it('error: marca el permiso como denegado si se bloquea el micrófono', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, errorCode, isPermissionDenied } = useSpeechRecognition()

    start(vi.fn())
    FakeSpeechRecognition.lastInstance.onerror({ error: 'not-allowed' })

    expect(errorCode.value).toBe('not-allowed')
    expect(isPermissionDenied.value).toBe(true)
  })

  it('deja de escuchar cuando termina el reconocimiento', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, isListening } = useSpeechRecognition()

    start(vi.fn())
    FakeSpeechRecognition.lastInstance.onend()

    expect(isListening.value).toBe(false)
  })

  it('stop detiene el reconocimiento en curso', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, stop } = useSpeechRecognition()

    start(vi.fn())
    stop()

    expect(FakeSpeechRecognition.lastInstance.stop).toHaveBeenCalled()
  })

  it('no hace nada al empezar si el navegador no tiene Web Speech API', () => {
    const { start, isListening } = useSpeechRecognition()

    start(vi.fn())

    expect(isListening.value).toBe(false)
  })

  it('no crea un segundo reconocimiento si ya está escuchando', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start } = useSpeechRecognition()

    start(vi.fn())
    const firstRecognition = FakeSpeechRecognition.lastInstance
    start(vi.fn())

    expect(FakeSpeechRecognition.lastInstance).toBe(firstRecognition)
  })

  it('al volver a empezar borra el error anterior', () => {
    window.SpeechRecognition = FakeSpeechRecognition
    const { start, errorCode } = useSpeechRecognition()

    start(vi.fn())
    FakeSpeechRecognition.lastInstance.onerror({ error: 'no-speech' })
    FakeSpeechRecognition.lastInstance.onend()
    start(vi.fn())

    expect(errorCode.value).toBeNull()
  })
})