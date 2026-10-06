import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SalesReportPanel from './SalesReportPanel.vue'
import { getSalesReportPdf, getSalesSummary } from '../services/reports.service'
import { downloadFile } from '../utils/downloadFile'

vi.mock('../services/reports.service', () => ({
  getSalesSummary: vi.fn(),
  getSalesReportPdf: vi.fn(),
}))

vi.mock('../utils/downloadFile', () => ({
  downloadFile: vi.fn(),
}))

async function mountPanel() {
  const wrapper = mount(SalesReportPanel)
  await flushPromises()
  return wrapper
}

function findDownloadButton(wrapper) {
  return wrapper.find('.sales-report__download')
}

describe('SalesReportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getSalesSummary.mockResolvedValue({ revenue: 100, orders: 4 })
    getSalesReportPdf.mockResolvedValue({ blob: new Blob(['%PDF']), fileName: 'resumen.pdf' })
  })

  it('al abrirse carga el resumen de hoy y muestra las fechas', async () => {
    const wrapper = await mountPanel()

    expect(getSalesSummary).toHaveBeenCalledWith('day')
    expect(wrapper.find('.sales-report__period').text()).toMatch(/\d{4}$/)
    expect(wrapper.text().replace(/\s/g, ' ')).toContain('25,00 €')
  })

  it('al cambiar de periodo vuelve a pedir el resumen', async () => {
    const wrapper = await mountPanel()

    await wrapper.find('button[aria-pressed="false"]').trigger('click')
    await flushPromises()

    expect(getSalesSummary).toHaveBeenLastCalledWith('week')
  })

  it('muestra un aviso si no se puede cargar el resumen', async () => {
    getSalesSummary.mockRejectedValue(new Error('500'))
    const wrapper = await mountPanel()

    expect(wrapper.text()).toContain('No se ha podido cargar el resumen de ventas.')
  })

  it('descarga el PDF del periodo elegido', async () => {
    const wrapper = await mountPanel()

    await findDownloadButton(wrapper).trigger('click')
    await flushPromises()

    expect(getSalesReportPdf).toHaveBeenCalledWith('day')
    expect(downloadFile).toHaveBeenCalled()
  })

  it('mientras genera el PDF el botón cambia de texto y se desactiva', async () => {
    getSalesReportPdf.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountPanel()

    await findDownloadButton(wrapper).trigger('click')

    expect(findDownloadButton(wrapper).text()).toContain('Generando PDF...')
    expect(findDownloadButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('muestra un aviso si no se puede generar el PDF', async () => {
    getSalesReportPdf.mockRejectedValue(new Error('500'))
    const wrapper = await mountPanel()

    await findDownloadButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe('No se ha podido generar el PDF. Inténtalo de nuevo.')
  })
})