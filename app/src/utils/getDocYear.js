/**
 * Extrae y normaliza el año de un documento (albarán o factura)
 * priorizando la fecha contable (date) con fallback a la numeración correlativa.
 *
 * @param {Object} doc - Documento con campo `date` y/o `number`
 * @returns {number|null} Año del documento (ej. 2026) o null si no se pudo determinar
 */
export default function getDocYear(doc) {
  if (!doc) return null

  // 1. Prioridad: Fecha contable o de generación del documento
  const rawDate = doc.date || doc.generatedAt || doc.transportDate
  if (rawDate) {
    const d = new Date(rawDate)
    if (!isNaN(d.getTime())) {
      return d.getFullYear()
    }
  }

  // 2. Fallback: Parseo del campo number
  if (doc.number && typeof doc.number === "string") {
    const trimmed = doc.number.trim()

    // Formato estándar YYYY/NNN (ej. 2026/001 o DECA-2026/001)
    if (trimmed.includes("/")) {
      const parts = trimmed.replace(/^DECA-/, "").split("/")
      const year = parseInt(parts[0], 10)
      if (!isNaN(year) && year > 1900 && year < 2200) {
        return year
      }
    }

    // Formato legacy ALB-YYYY-NNN o FRA-YYYY-NNN
    if (trimmed.startsWith("ALB-") || trimmed.startsWith("FRA-")) {
      const parts = trimmed.split("-")
      const year = parseInt(parts[1], 10)
      if (!isNaN(year) && year > 1900 && year < 2200) {
        return year
      }
    }
  }

  return null
}
