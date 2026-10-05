import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useAudioLevel } from './useAudioLevel'

const BAR_COUNT = 5

function buildFakeAudio() {
  const track = { stop: vi.fn() }
  const stream = { getTracks: () => [track] }
  const analyser = {
    fftSize: 0,
    frequencyBinCount: 8,
    getByteFrequencyData: vi.fn((data) => data.fill(255)),
  }
  const audioContext = {
    createAnalyser: () => analyser,
    createMediaStreamSource: () => ({ connect: vi.fn() }),
    close: vi.fn(),
  }
  return { track, stream, audioContext }
}

// El composable usa onUnmounted, así que se monta dentro de un componente de prueba.
function mountComposable() {
  let result
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useAudioLevel()
        return () => null
      },
    })
  )
  return { wrapper, ...result }
}

describe('useAudioLevel', () => {
  let fakeAudio

  beforeEach(() => {
    fakeAudio = buildFakeAudio()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn().mockResolvedValue(fakeAudio.stream) },
      configurable: true,
    })
    globalThis.AudioContext = vi.fn(function () {
      return fakeAudio.audioContext
    })
    globalThis.requestAnimationFrame = vi.fn()
    globalThis.cancelAnimationFrame = vi.fn()
  })

  afterEach(() => {
    delete globalThis.AudioContext
  })

  it('empieza con todas las barras a cero', () => {
    const { levels } = mountComposable()

    expect(levels.value).toEqual(Array(BAR_COUNT).fill(0))
  })

  it('startMeter pide el micrófono y actualiza el nivel de las barras', async () => {
    const { levels, startMeter } = mountComposable()

    await startMeter()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(levels.value).toEqual(Array(BAR_COUNT).fill(1))
  })

  it('stopMeter libera el micrófono y vuelve a poner las barras a cero', async () => {
    const { levels, startMeter, stopMeter } = mountComposable()
    await startMeter()

    stopMeter()

    expect(fakeAudio.track.stop).toHaveBeenCalled()
    expect(fakeAudio.audioContext.close).toHaveBeenCalled()
    expect(levels.value).toEqual(Array(BAR_COUNT).fill(0))
  })

  it('libera el micrófono al desmontar el componente', async () => {
    const { wrapper, startMeter } = mountComposable()
    await startMeter()

    wrapper.unmount()

    expect(fakeAudio.track.stop).toHaveBeenCalled()
  })

  it('no rompe nada si no se puede acceder al micrófono', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('NotAllowedError'))
    const { levels, startMeter } = mountComposable()

    await startMeter()

    expect(levels.value).toEqual(Array(BAR_COUNT).fill(0))
  })
})