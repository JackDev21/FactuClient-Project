/**
 * Extrae de forma segura el mes de un documento (0 = Enero, 11 = Diciembre).
 * Prioriza la fecha contable (date) con fallback a generatedAt o transportDate.
 *
 * @param {Object} doc - Documento con campo date, generatedAt o transportDate
 * @returns {number|null} Mes (0 a 11) o null si no se pudo determinar
 */
export default function getDocMonth(doc) {
  if (!doc) return null

  const rawDate = doc.date || doc.generatedAt || doc.transportDate
  if (rawDate) {
    const d = new Date(rawDate)
    if (!isNaN(d.getTime())) {
      return d.getMonth()
    }
  }

  return null
}
