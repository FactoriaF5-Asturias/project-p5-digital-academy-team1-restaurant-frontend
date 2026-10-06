// Responsabilidad: guardar en el equipo del usuario un archivo recibido del backend.
// Crea un enlace temporal, lo pulsa y libera la memoria.
export function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}