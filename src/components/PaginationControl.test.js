import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationControl from './PaginationControl.vue'

describe('PaginationControl', () => {
  it('shows the current page and total pages', () => {
    const wrapper = mount(PaginationControl, { props: { currentPage: 2, totalPages: 5 } })

    expect(wrapper.text()).toContain('Página 2 de 5')
  })

  it('disables the previous button on the first page', () => {
    const wrapper = mount(PaginationControl, { props: { currentPage: 1, totalPages: 5 } })

    expect(wrapper.find('.pagination-control__button--prev').attributes('disabled')).toBeDefined()
  })

  it('disables the next button on the last page', () => {
    const wrapper = mount(PaginationControl, { props: { currentPage: 5, totalPages: 5 } })

    expect(wrapper.find('.pagination-control__button--next').attributes('disabled')).toBeDefined()
  })

  it('emits change-page with the previous page number when clicking previous', async () => {
    const wrapper = mount(PaginationControl, { props: { currentPage: 3, totalPages: 5 } })

    await wrapper.find('.pagination-control__button--prev').trigger('click')

    expect(wrapper.emitted('change-page')[0]).toEqual([2])
  })

  it('emits change-page with the next page number when clicking next', async () => {
    const wrapper = mount(PaginationControl, { props: { currentPage: 3, totalPages: 5 } })

    await wrapper.find('.pagination-control__button--next').trigger('click')

    expect(wrapper.emitted('change-page')[0]).toEqual([4])
  })
})
