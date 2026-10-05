import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePagination } from './usePagination'

const PAGE_SIZE = 3

function buildItems(count) {
  return ref(Array.from({ length: count }, (_, index) => index + 1))
}

describe('usePagination', () => {
  it('starts on the first page and shows only the first items', () => {
    const { currentPage, paginatedItems } = usePagination(buildItems(7), PAGE_SIZE)

    expect(currentPage.value).toBe(1)
    expect(paginatedItems.value).toEqual([1, 2, 3])
  })

  it('calculates the total number of pages rounding up', () => {
    const { totalPages } = usePagination(buildItems(7), PAGE_SIZE)

    expect(totalPages.value).toBe(3)
  })

  it('always has at least one page, even with an empty list', () => {
    const { totalPages, paginatedItems } = usePagination(buildItems(0), PAGE_SIZE)

    expect(totalPages.value).toBe(1)
    expect(paginatedItems.value).toEqual([])
  })

  it('goes to the requested page and shows its items', () => {
    const { currentPage, paginatedItems, goToPage } = usePagination(buildItems(7), PAGE_SIZE)

    goToPage(3)

    expect(currentPage.value).toBe(3)
    expect(paginatedItems.value).toEqual([7])
  })

  it('ignores pages outside the valid range', () => {
    const { currentPage, goToPage } = usePagination(buildItems(7), PAGE_SIZE)

    goToPage(0)
    expect(currentPage.value).toBe(1)

    goToPage(9)
    expect(currentPage.value).toBe(1)
  })

  it('resetPage goes back to the first page', () => {
    const { currentPage, goToPage, resetPage } = usePagination(buildItems(7), PAGE_SIZE)

    goToPage(2)
    resetPage()

    expect(currentPage.value).toBe(1)
  })

  it('moves back to the last existing page when the list gets shorter', async () => {
    const items = buildItems(7)
    const { currentPage, goToPage } = usePagination(items, PAGE_SIZE)

    goToPage(3)
    items.value = items.value.slice(0, 4)
    await nextTick()

    expect(currentPage.value).toBe(2)
  })
})