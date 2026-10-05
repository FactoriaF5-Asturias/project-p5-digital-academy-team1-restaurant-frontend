import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useCategoryFilter, ALL_CATEGORIES } from './useCategoryFilter'
import { PRODUCT_CATEGORIES } from '../constants/productCategories'

function buildItems() {
  return ref([
    { id: 1, category: PRODUCT_CATEGORIES.NIGIRI },
    { id: 2, category: PRODUCT_CATEGORIES.NIGIRI },
    { id: 3, category: PRODUCT_CATEGORIES.BEBIDAS },
  ])
}

function findOption(options, value) {
  return options.find((option) => option.value === value)
}

describe('useCategoryFilter', () => {
  it('starts with all categories selected and returns every item', () => {
    const { activeCategory, filteredItems } = useCategoryFilter(buildItems())

    expect(activeCategory.value).toBe(ALL_CATEGORIES)
    expect(filteredItems.value).toHaveLength(3)
  })

  it('builds one option per category plus "Todas", with its label and count', () => {
    const { filterOptions } = useCategoryFilter(buildItems())

    const categoriesCount = Object.values(PRODUCT_CATEGORIES).length
    expect(filterOptions.value).toHaveLength(categoriesCount + 1)
    expect(filterOptions.value[0]).toEqual({ value: ALL_CATEGORIES, label: 'Todas', count: 3 })
    expect(findOption(filterOptions.value, PRODUCT_CATEGORIES.NIGIRI)).toEqual({
      value: PRODUCT_CATEGORIES.NIGIRI,
      label: 'Nigiri',
      count: 2,
    })
    expect(findOption(filterOptions.value, PRODUCT_CATEGORIES.POSTRES).count).toBe(0)
  })

  it('filters the items by the selected category', () => {
    const { filteredItems, setCategory } = useCategoryFilter(buildItems())

    setCategory(PRODUCT_CATEGORIES.BEBIDAS)

    expect(filteredItems.value).toEqual([{ id: 3, category: PRODUCT_CATEGORIES.BEBIDAS }])
  })

  it('returns an empty list when the selected category has no items', () => {
    const { filteredItems, setCategory } = useCategoryFilter(buildItems())

    setCategory(PRODUCT_CATEGORIES.POSTRES)

    expect(filteredItems.value).toEqual([])
  })

  it('updates the counts and the filtered list when the items change', () => {
    const items = buildItems()
    const { filterOptions, filteredItems, setCategory } = useCategoryFilter(items)
    setCategory(PRODUCT_CATEGORIES.NIGIRI)

    items.value.push({ id: 4, category: PRODUCT_CATEGORIES.NIGIRI })

    expect(filteredItems.value).toHaveLength(3)
    expect(findOption(filterOptions.value, ALL_CATEGORIES).count).toBe(4)
  })
})