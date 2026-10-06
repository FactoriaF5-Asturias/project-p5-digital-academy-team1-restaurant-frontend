import { describe, it, expect, vi, afterEach } from 'vitest'
import { downloadFile } from './downloadFile'

describe('downloadFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('descarga el archivo con su nombre y libera la memoria', () => {
    URL.createObjectURL = vi.fn().mockReturnValue('blob:resumen')
    URL.revokeObjectURL = vi.fn()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const blob = new Blob(['%PDF'], { type: 'application/pdf' })

    downloadFile(blob, 'resumen-ventas.pdf')

    const clickedLink = clickSpy.mock.contexts[0]
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(clickedLink.download).toBe('resumen-ventas.pdf')
    expect(clickedLink.href).toBe('blob:resumen')
    expect(document.body.contains(clickedLink)).toBe(false)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:resumen')
  })
})