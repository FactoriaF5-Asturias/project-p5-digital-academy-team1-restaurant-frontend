import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from './LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('shows the default text when no label is given', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.text()).toContain('Cargando...')
  })

  it('shows the label it receives', () => {
    const wrapper = mount(LoadingSpinner, { props: { label: 'Cargando productos...' } })

    expect(wrapper.text()).toContain('Cargando productos...')
  })

  it('is announced to screen readers as a status', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })
})