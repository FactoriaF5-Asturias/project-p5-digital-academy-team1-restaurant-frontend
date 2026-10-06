import { ref } from 'vue'
import { getSalesReportPdf } from '../services/reports.service'
import { downloadFile } from '../utils/downloadFile'

// Responsabilidad: descargar el PDF del resumen de ventas y controlar
// el estado "generando" y el error.

const DOWNLOAD_ERROR_MESSAGE = 'No se ha podido generar el PDF. Inténtalo de nuevo.'

export function useSalesReportDownload() {
  const isDownloading = ref(false)
  const downloadError = ref('')

  async function downloadReport(period) {
    if (isDownloading.value) return

    isDownloading.value = true
    downloadError.value = ''

    try {
      const { blob, fileName } = await getSalesReportPdf(period)
      downloadFile(blob, fileName)
    } catch (err) {
      downloadError.value = DOWNLOAD_ERROR_MESSAGE
      console.error('[useSalesReportDownload] Error al descargar el PDF:', err)
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    downloadError,
    downloadReport,
  }
}