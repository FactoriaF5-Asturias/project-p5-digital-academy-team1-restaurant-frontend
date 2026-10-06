<script setup>
import { reactive, ref, computed } from 'vue'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '../constants/productCategories'
import { PRODUCT_FORM_MODES } from '../constants/productFormModes'
import { validateProductForm } from '../utils/productValidation'

// Formulario de producto para añadir o editar, según el modo que recibe.
// Valida los datos y, si son correctos, emite submit con los datos limpios.
// No llama al backend: eso lo decide el padre.

const FORM_TEXTS = Object.freeze({
  [PRODUCT_FORM_MODES.CREATE]: {
    title: 'Añadir nuevo producto a la carta',
    submitLabel: 'Guardar',
  },
  [PRODUCT_FORM_MODES.EDIT]: {
    title: 'Editar producto',
    submitLabel: 'Guardar cambios',
  },
})

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => Object.values(PRODUCT_FORM_MODES).includes(value),
  },
  initialProduct: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const categoryOptions = Object.values(PRODUCT_CATEGORIES)
const isCreateMode = computed(() => props.mode === PRODUCT_FORM_MODES.CREATE)
const texts = computed(() => FORM_TEXTS[props.mode])

function buildInitialForm(product) {
  return {
    name: product?.name ?? '',
    category: product?.category ?? PRODUCT_CATEGORIES.ESPECIALES,
    imageUrl: product?.imageUrl ?? '',
    price: product?.price ?? '',
    description: product?.description ?? '',
  }
}

const initialForm = buildInitialForm(props.initialProduct)
const form = reactive({ ...initialForm })
const validationError = ref('')

const hasChanges = computed(() =>
  Object.keys(initialForm).some((key) => String(form[key]) !== String(initialForm[key]))
)
const canSubmit = computed(() => isCreateMode.value || hasChanges.value)
const displayedError = computed(() => validationError.value || props.errorMessage)

function handleSubmit() {
  validationError.value = validateProductForm(form, { requireImage: isCreateMode.value })
  if (validationError.value) return

  emit('submit', {
    name: form.name.trim(),
    category: form.category,
    imageUrl: form.imageUrl.trim(),
    price: parseFloat(form.price),
    description: form.description.trim(),
  })
}
</script>

<template>
  <div class="product-form" role="dialog" aria-modal="true" :aria-label="texts.title">
    <div class="product-form__box">
      <h3 class="product-form__title">{{ texts.title }}</h3>

      <form class="product-form__form" @submit.prevent="handleSubmit">
        <div>
          <label class="product-form__label" for="product-name">Nombre</label>
          <input
            id="product-name"
            v-model="form.name"
            type="text"
            class="product-form__input"
            placeholder="Ej. Merge Nigiri"
          />
        </div>

        <div v-if="isCreateMode">
          <label class="product-form__label" for="product-image">Imagen (nombre del archivo)</label>
          <input
            id="product-image"
            v-model="form.imageUrl"
            type="text"
            class="product-form__input"
            placeholder="Ej. merge-nigiri.png"
          />
        </div>

        <div>
          <label class="product-form__label" for="product-category">Categoría</label>
          <select id="product-category" v-model="form.category" class="product-form__input">
            <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ CATEGORY_LABELS[cat] }}</option>
          </select>
        </div>

        <div>
          <label class="product-form__label" for="product-price">Precio (€)</label>
          <input
            id="product-price"
            v-model="form.price"
            type="number"
            step="0.01"
            min="0"
            class="product-form__input"
            placeholder="Ej. 12.50"
          />
        </div>

        <div>
          <label class="product-form__label" for="product-description">Descripción</label>
          <textarea
            id="product-description"
            v-model="form.description"
            rows="3"
            class="product-form__input product-form__input--textarea"
            placeholder="Breve descripción del producto"
          ></textarea>
        </div>

        <p v-if="displayedError" class="product-form__error">{{ displayedError }}</p>

        <div class="product-form__actions">
          <button type="button" class="product-form__button" @click="emit('cancel')">
            Cancelar
          </button>
          <button
            v-if="canSubmit"
            type="submit"
            :disabled="isSaving"
            class="product-form__button product-form__button--primary"
          >
            {{ isSaving ? 'Guardando...' : texts.submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@reference "../style.css";

.product-form {
  @apply fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4;
}

.product-form__box {
  @apply bg-white rounded-xl p-6 max-w-md w-full shadow-lg;
}

.product-form__title {
  @apply text-lg font-heading font-bold text-on-surface mb-4;
}

.product-form__form {
  @apply flex flex-col gap-3;
}

.product-form__label {
  @apply block text-xs font-semibold text-on-surface-variant mb-1;
}

.product-form__input {
  @apply w-full px-3 py-2 rounded-lg border border-outline text-sm outline-none focus:border-primary;
}

.product-form__input--textarea {
  @apply resize-none;
}

.product-form__error {
  @apply text-error text-sm;
}

.product-form__actions {
  @apply flex justify-end gap-3 pt-2;
}

.product-form__button {
  @apply px-4 py-2 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-high transition;
}

.product-form__button--primary {
  @apply bg-primary text-on-primary border-primary hover:bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>