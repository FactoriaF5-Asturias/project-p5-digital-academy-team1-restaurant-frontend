import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PeriodSelector from './PeriodSelector.vue'
import { REPORT_PERIOD_OPTIONS } from '../constants/reportPeriods'

function mountSelector(modelValue = 'day') {
  return mount(PeriodSelector, {
    props: {
      options: REPORT_PERIOD_OPTIONS,
      modelValue,
      'onUpdate:modelValue': () => {},
    },
  })
}

describe('PeriodSelector', () => {
  it('muestra un botón por periodo', () => {
    const labels = mountSelector().findAll('button').map((button) => button.text())

    expect(labels).toEqual(['Hoy', 'Semana', 'Mes'])
  })

  it('marca el periodo elegido para los lectores de pantalla', () => {
    const buttons = mountSelector('week').findAll('button')

    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].classes()).toContain('period-selector__option--active')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
  })

  it('avisa al padre al elegir otro periodo', async () => {
    const wrapper = mountSelector('day')

    await wrapper.findAll('button')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['month'])
  })
})
