import { ref, computed } from 'vue'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '../constants/productCategories'

export const ALL_CATEGORIES = 'ALL'
const ALL_CATEGORIES_LABEL = 'Todas'
const CATEGORY_VALUES = Object.values(PRODUCT_CATEGORIES)

// Filtra una lista reactiva (ref o computed) por categoría y cuenta cuántos
// elementos hay en cada una. Devuelve las opciones listas para los filtros.
export function useCategoryFilter(items) {
  const activeCategory = ref(ALL_CATEGORIES)

  const countsByCategory = computed(() => {
    const counts = { [ALL_CATEGORIES]: items.value.length }
    for (const category of CATEGORY_VALUES) {
      counts[category] = items.value.filter((item) => item.category === category).length
    }
    return counts
  })

  const filterOptions = computed(() =>
    [ALL_CATEGORIES, ...CATEGORY_VALUES].map((category) => ({
      value: category,
      label: category === ALL_CATEGORIES ? ALL_CATEGORIES_LABEL : CATEGORY_LABELS[category],
      count: countsByCategory.value[category],
    }))
  )

  const filteredItems = computed(() => {
    if (activeCategory.value === ALL_CATEGORIES) return items.value
    return items.value.filter((item) => item.category === activeCategory.value)
  })

  function setCategory(category) {
    activeCategory.value = category
  }

  return {
    activeCategory,
    filterOptions,
    filteredItems,
    setCategory,
  }
}