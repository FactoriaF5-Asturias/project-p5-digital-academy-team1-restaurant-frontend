import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChannelSplitBar from './ChannelSplitBar.vue'

// Intl usa un espacio especial antes del símbolo €, por eso se normaliza.
const normalizeSpaces = (text) => text.replace(/\s+/g, ' ')

const CHANNELS = {
  inStore: { revenue: 2989, percentage: 62 },
  delivery: { revenue: 1831, percentage: 38 },
}

function mountBar() {
  return mount(ChannelSplitBar, { props: { channels: CHANNELS } })
}

describe('ChannelSplitBar', () => {
  it('reparte la barra según el porcentaje de cada canal', () => {
    const segments = mountBar().findAll('.channel-split__bar .channel-split__segment')

    expect(segments).toHaveLength(2)
    expect(segments[0].classes()).toContain('channel-split__segment--in-store')
    expect(segments[0].attributes('style')).toContain('width: 62%')
    expect(segments[1].classes()).toContain('channel-split__segment--delivery')
    expect(segments[1].attributes('style')).toContain('width: 38%')
  })

  it('oculta la barra a los lectores de pantalla porque la leyenda ya lo dice', () => {
    expect(mountBar().find('.channel-split__bar').attributes('aria-hidden')).toBe('true')
  })

  it('muestra en la leyenda el canal, el porcentaje y los euros', () => {
    const items = mountBar()
      .findAll('.channel-split__legend-item')
      .map((item) => normalizeSpaces(item.text()))

    expect(items).toEqual(['Sala Tablets · 62 % · 2989 €', 'A Domicilio · 38 % · 1831 €'])
  })
})