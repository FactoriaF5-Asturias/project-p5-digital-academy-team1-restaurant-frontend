import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChefNoteField from './ChefNoteField.vue'
import { useCheckoutStore } from '../stores/checkout'
import { CHEF_NOTE_SUGGESTIONS } from '../constants/chefNoteSuggestions'

function mountChefNoteField() {
  setActivePinia(createPinia())
  const checkoutStore = useCheckoutStore()

  const wrapper = mount(ChefNoteField)

  return { wrapper, checkoutStore }
}

describe('ChefNoteField', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders an empty textarea and one chip per suggestion by default', () => {
    const { wrapper } = mountChefNoteField()

    expect(wrapper.find('#chef-note-textarea').element.value).toBe('')
    expect(wrapper.findAll('.chef-note__chip')).toHaveLength(CHEF_NOTE_SUGGESTIONS.length)
  })

  it('updates the chef note in the store when typed', async () => {
    const { wrapper, checkoutStore } = mountChefNoteField()

    await wrapper.find('#chef-note-textarea').setValue('Sin cebolla, por favor')

    expect(checkoutStore.chefNote).toBe('Sin cebolla, por favor')
  })

  it('sets the note directly when a chip is clicked and the note was empty', async () => {
    const { wrapper, checkoutStore } = mountChefNoteField()

    const chip = wrapper.findAll('.chef-note__chip').find((c) => c.text() === 'Sin wasabi')
    await chip.trigger('click')

    expect(checkoutStore.chefNote).toBe('Sin wasabi')
  })

  it('appends a chip to the existing note separated by a comma', async () => {
    const { wrapper, checkoutStore } = mountChefNoteField()
    checkoutStore.chefNote = 'Alergia a marisco'

    const chip = wrapper.findAll('.chef-note__chip').find((c) => c.text() === 'Palillos extra')
    await chip.trigger('click')

    expect(checkoutStore.chefNote).toBe('Alergia a marisco, Palillos extra')
  })

  it('does not duplicate a suggestion already included in the note', async () => {
    const { wrapper, checkoutStore } = mountChefNoteField()
    checkoutStore.chefNote = 'Sin wasabi'

    const chip = wrapper.findAll('.chef-note__chip').find((c) => c.text() === 'Sin wasabi')
    await chip.trigger('click')

    expect(checkoutStore.chefNote).toBe('Sin wasabi')
  })
})
