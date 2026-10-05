import { ref } from 'vue'

const SPEECH_LANGUAGE = 'es-ES'
const PERMISSION_ERROR_CODES = ['not-allowed', 'service-not-allowed']

export function useSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = Boolean(SpeechRecognition)
  const isListening = ref(false)
  const errorCode = ref(null)
  const isPermissionDenied = ref(false)
  let recognition = null

  function start(onResult) {
    if (!isSupported || isListening.value) return

    errorCode.value = null
    recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LANGUAGE
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      onResult(event.results[0][0].transcript)
    }
    recognition.onerror = (event) => {
      console.warn('[useSpeechRecognition] Error de reconocimiento:', event.error)
      errorCode.value = event.error
      isPermissionDenied.value = PERMISSION_ERROR_CODES.includes(event.error)
    }
    recognition.onend = () => {
      isListening.value = false
      recognition = null
    }

    isListening.value = true
    recognition.start()
  }

  function stop() {
    recognition?.stop()
  }

  return { isSupported, isListening, isPermissionDenied, errorCode, start, stop }
}