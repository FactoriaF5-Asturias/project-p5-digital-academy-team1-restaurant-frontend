import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheFooter from './TheFooter.vue'

describe('TheFooter', () => {
  it('renderiza el nombre de la marca y la descripción', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.text()).toContain('GitSushi')
    expect(wrapper.text()).toContain('Programmed to perfection')
  })

  it('renderiza la información de contacto del restaurante', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.text()).toContain('Calle Repositorio 42, Madrid')
    expect(wrapper.text()).toContain('Todos los días 13:00 a 23:30')
    expect(wrapper.text()).toContain('hola@gitsushi.dev')
  })

  it('renderiza los 7 enlaces de GitHub de los devs con su nombre y URL correctos', () => {
    const wrapper = mount(TheFooter)
    const devLinks = wrapper.findAll('a[href^="https://github.com/"]')
    expect(devLinks).toHaveLength(7)

    const expected = [
      { name: 'Andrea', username: 'andreaperezgon' },
      { name: 'Danil', username: 'danielmuntyanu' },
      { name: 'Ioana', username: 'Alexapop' },
      { name: 'Jose', username: 'Josecgh' },
      { name: 'Luisa', username: 'lcortes89' },
      { name: 'Nieves', username: 'duran-ni' },
      { name: 'Raana', username: 'Raana-1375' },
    ]

    expected.forEach(({ name, username }) => {
      const link = devLinks.find((a) => a.text() === name)
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe(`https://github.com/${username}`)
    })
  })

  it('cada enlace de dev abre en una pestaña nueva de forma segura', () => {
    const wrapper = mount(TheFooter)
    const devLinks = wrapper.findAll('a[href^="https://github.com/"]')
    devLinks.forEach((link) => {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })
  })
})