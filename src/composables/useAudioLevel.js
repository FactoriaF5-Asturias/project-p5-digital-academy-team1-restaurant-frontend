import { ref, onUnmounted } from 'vue'

const BAR_COUNT = 5
const FFT_SIZE = 64
const MAX_BYTE_VALUE = 255

function emptyLevels() {
  return Array(BAR_COUNT).fill(0)
}

export function useAudioLevel() {
  const levels = ref(emptyLevels())
  let stream = null
  let audioContext = null
  let animationFrameId = null

  async function startMeter() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = FFT_SIZE
      audioContext.createMediaStreamSource(stream).connect(analyser)
      const frequencyData = new Uint8Array(analyser.frequencyBinCount)

      const updateLevels = () => {
        analyser.getByteFrequencyData(frequencyData)
        levels.value = levels.value.map((_, index) => frequencyData[index + 1] / MAX_BYTE_VALUE)
        animationFrameId = requestAnimationFrame(updateLevels)
      }
      updateLevels()
    } catch (err) {
      console.warn('[useAudioLevel] No se pudo acceder al micrófono:', err)
    }
  }

  function stopMeter() {
    cancelAnimationFrame(animationFrameId)
    stream?.getTracks().forEach((track) => track.stop())
    audioContext?.close()
    stream = null
    audioContext = null
    levels.value = emptyLevels()
  }

  onUnmounted(stopMeter)

  return { levels, startMeter, stopMeter }
}