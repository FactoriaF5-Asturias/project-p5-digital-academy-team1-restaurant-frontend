import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from './LoadingSpinner.vue'

const STEAM_LINES = 3

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

  it('draws the maki with its rice and filling', () => {
    const wrapper = mount(LoadingSpinner)

    const maki = wrapper.find('.loading-spinner__maki')

    expect(maki.exists()).toBe(true)
    expect(maki.find('.loading-spinner__rice .loading-spinner__filling').exists()).toBe(true)
  })

  it('draws three steam lines above the maki', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.findAll('.loading-spinner__steam-line')).toHaveLength(STEAM_LINES)
  })

  it('hides the animation from screen readers so only the label is read', () => {
    const wrapper = mount(LoadingSpinner)

    const animation = wrapper.find('.loading-spinner__animation')

    expect(animation.attributes('aria-hidden')).toBe('true')
    expect(animation.text()).toBe('')
  })
})