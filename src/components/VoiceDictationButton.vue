<script setup>
import { computed, watch } from 'vue'
import { useSpeechRecognition } from '../composables/useSpeechRecognition'
import { useAudioLevel } from '../composables/useAudioLevel'

// Botón de micrófono para dictar el valor de un campo de texto.
// Se coloca junto al input: muestra la onda de audio, las instrucciones y los
// avisos de error, y emite el texto reconocido. Nunca borra lo ya escrito:
// solo el padre decide qué hacer con el texto que recibe.

const MIN_BAR_HEIGHT_PERCENT = 15
const VOICE_ERROR_MESSAGES = Object.freeze({
  NOT_UNDERSTOOD: 'No se ha entendido el audio. Inténtalo de nuevo o escríbelo a mano.',
  PERMISSION_DENIED:
    'Has bloqueado el micrófono. Permítelo desde el icono junto a la dirección de la página o escríbelo a mano.',
})

const props = defineProps({
  fieldLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['transcript'])

const { isSupported, isListening, isPermissionDenied, errorCode, start, stop } = useSpeechRecognition()
const { levels, startMeter, stopMeter } = useAudioLevel()

const buttonLabel = computed(() =>
  isListening.value ? 'Terminar dictado' : `Dictar ${props.fieldLabel.toLowerCase()} por voz`
)

const errorMessage = computed(() => {
  if (!errorCode.value) return null
  return isPermissionDenied.value
    ? VOICE_ERROR_MESSAGES.PERMISSION_DENIED
    : VOICE_ERROR_MESSAGES.NOT_UNDERSTOOD
})

function handleToggleDictation() {
  if (isListening.value) {
    stop()
    return
  }
  start((transcript) => emit('transcript', transcript))
  startMeter()
}

function barHeight(level) {
  return `${Math.max(level * 100, MIN_BAR_HEIGHT_PERCENT)}%`
}

watch(isListening, (listening) => {
  if (!listening) stopMeter()
})
</script>

<template>
  <div class="voice-dictation">
    <button
      type="button"
      class="voice-dictation__mic"
      :class="{ 'voice-dictation__mic--listening': isListening }"
      :aria-label="buttonLabel"
      :aria-pressed="isListening"
      :disabled="!isSupported"
      @click="handleToggleDictation"
    >
      🎤
    </button>

    <div v-if="isSupported" class="voice-dictation__status">
      <div v-if="isListening" class="voice-dictation__wave" aria-hidden="true">
        <span
          v-for="(level, index) in levels"
          :key="index"
          class="voice-dictation__bar"
          :style="{ height: barHeight(level) }"
        />
      </div>
      <p class="voice-dictation__hint" aria-live="polite">
        {{ isListening ? 'Escuchando… pulsa de nuevo para terminar' : 'Pulsa el micrófono para dictar' }}
      </p>
    </div>

    <p v-else class="voice-dictation__hint">
      Tu navegador no permite el dictado por voz. Escríbelo a mano.
    </p>

    <p v-if="errorMessage" role="alert" class="voice-dictation__error">
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
@reference "../style.css";

/* "contents": el botón y los mensajes se colocan directamente en la
   rejilla del padre (botón junto al input, mensajes debajo). */
.voice-dictation {
  @apply contents;
}

.voice-dictation__mic {
  @apply h-12 w-12 flex items-center justify-center rounded-lg border border-outline bg-surface-container hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.voice-dictation__mic--listening {
  @apply border-primary bg-primary/15 animate-pulse;
}

.voice-dictation__status {
  @apply col-span-2 flex items-center gap-3 min-h-6;
}

.voice-dictation__wave {
  @apply flex items-end gap-1 h-6;
}

.voice-dictation__bar {
  @apply w-1.5 rounded-full bg-primary transition-[height] duration-75;
}

.voice-dictation__hint {
  @apply col-span-2 text-xs text-on-surface-variant;
}

.voice-dictation__error {
  @apply col-span-2 text-xs text-error;
}
</style>