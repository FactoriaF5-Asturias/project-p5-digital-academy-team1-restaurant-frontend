import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilters from './CategoryFilters.vue'

const OPTIONS = [
  { value: 'ALL', label: 'Todas', count: 3 },
  { value: 'NIGIRI', label: 'Nigiri', count: 2 },
  { value: 'BEBIDAS', label: 'Bebidas', count: 1 },
]

function mountFilters(activeCategory = 'ALL') {
  return mount(CategoryFilters, { props: { options: OPTIONS, activeCategory } })
}

describe('CategoryFilters', () => {
  it('shows one button per option with its label and count', () => {
    const buttons = mountFilters().findAll('button')

    expect(buttons.map((button) => button.text())).toEqual(['Todas (3)', 'Nigiri (2)', 'Bebidas (1)'])
  })

  it('marks only the active category as pressed', () => {
    const buttons = mountFilters('NIGIRI').findAll('button')

    expect(buttons[1].classes()).toContain('category-filters__button--active')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[0].classes()).not.toContain('category-filters__button--active')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
  })

  it('emits select-category with the value of the clicked option', async () => {
    const wrapper = mountFilters()

    await wrapper.findAll('button')[2].trigger('click')

    expect(wrapper.emitted('select-category')[0]).toEqual(['BEBIDAS'])
  })
})