import crypto from "crypto"
import QRCode from "qrcode"

/**
 * Formatea una fecha a formato exigido por la AEAT: DD-MM-YYYY
 * @param {Date|string} date 
 * @returns {string} Fecha en formato DD-MM-YYYY
 */
export const formatDateAeat = (date) => {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

/**
 * Genera el timestamp en formato ISO 8601 ampliado con huso horario exacto (YYYY-MM-DDThh:mm:ssTZD)
 * según el estándar del Art. 13 de la Orden HAC/1177/2024.
 * @param {Date|string} [date=new Date()]
 * @returns {string} Timestamp ISO con huso horario (ej. 2026-09-12T11:30:00+02:00)
 */
export const getIsoDateTimeWithTimezone = (date = new Date()) => {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, "0")

  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())

  // Cálculo del huso horario local (minutos de diferencia con UTC)
  const timezoneOffsetMinutes = d.getTimezoneOffset()
  const tzSign = timezoneOffsetMinutes <= 0 ? "+" : "-"
  const absOffset = Math.abs(timezoneOffsetMinutes)
  const tzHours = pad(Math.floor(absOffset / 60))
  const tzMinutes = pad(absOffset % 60)

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`
}

/**
 * Construye la cadena de texto canónica sobre la que aplicar el hash SHA-256
 * según el Art. 13 y el documento de especificaciones técnicas de la AEAT.
 *
 * @param {Object} params
 * @param {string} params.nif - NIF del emisor
 * @param {string} params.numSerie - Número y serie de la factura (ej: 2026/001)
 * @param {string} params.fechaExpedicion - Fecha en formato DD-MM-YYYY
 * @param {string} [params.tipoFactura="F1"] - Tipo de factura (F1 = completa/ordinaria)
 * @param {number|string} params.cuotaTotal - Cuota de IVA (ej. 21.00)
 * @param {number|string} params.importeTotal - Importe total de la factura (ej. 121.00)
 * @param {string} [params.huellaAnterior=""] - Huella SHA-256 de la factura anterior
 * @param {string} params.fechaHoraHusoGenRegistro - Timestamp ISO con huso horario
 * @returns {string} Cadena canónica
 */
export const buildHashInputString = ({
  nif = "",
  numSerie = "",
  fechaExpedicion = "",
  tipoFactura = "F1",
  cuotaTotal = "0.00",
  importeTotal = "0.00",
  huellaAnterior = "",
  fechaHoraHusoGenRegistro = "",
}) => {
  const cleanNif = String(nif).trim().toUpperCase()
  const cleanNumSerie = String(numSerie).trim()
  const cleanFechaExpedicion = String(fechaExpedicion).trim()
  const cleanTipoFactura = String(tipoFactura).trim()
  const cleanCuotaTotal = typeof cuotaTotal === "number" ? cuotaTotal.toFixed(2) : String(cuotaTotal).trim()
  const cleanImporteTotal = typeof importeTotal === "number" ? importeTotal.toFixed(2) : String(importeTotal).trim()
  const cleanHuellaAnterior = String(huellaAnterior || "").trim().toUpperCase()
  const cleanFechaHoraHuso = String(fechaHoraHusoGenRegistro).trim()

  return (
    `IDEmisorFactura=${cleanNif}&` +
    `NumSerieFactura=${cleanNumSerie}&` +
    `FechaExpedicionFactura=${cleanFechaExpedicion}&` +
    `TipoFactura=${cleanTipoFactura}&` +
    `CuotaTotal=${cleanCuotaTotal}&` +
    `ImporteTotal=${cleanImporteTotal}&` +
    `Huella=${cleanHuellaAnterior}&` +
    `FechaHoraHusoGenRegistro=${cleanFechaHoraHuso}`
  )
}

/**
 * Calcula la huella SHA-256 de 64 caracteres en hexadecimal mayúsculas
 * @param {Object} params 
 * @returns {string} Hash SHA-256 de 64 caracteres en mayúsculas
 */
export const computeInvoiceHash = (params) => {
  const canonicalString = buildHashInputString(params)
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex").toUpperCase()
}

/**
 * Construye la URL de cotejo de la factura para el código QR según la especificación de la AEAT
 * (DetalleEspecificacTecnCodigoQRfactura.pdf - Art. 21 Orden HAC/1177/2024).
 *
 * @param {Object} params
 * @param {string} params.nif - NIF del emisor
 * @param {string} params.numSerie - Número y serie de la factura
 * @param {string} params.fechaExpedicion - Fecha en formato DD-MM-YYYY
 * @param {number|string} params.importeTotal - Importe total de la factura
 * @param {boolean} [params.isProduction] - Si apunta a producción o entorno de pruebas
 * @returns {string} URL oficial de la AEAT
 */
export const buildAeatQrUrl = ({
  nif = "",
  numSerie = "",
  fechaExpedicion = "",
  importeTotal = "0.00",
  isProduction = process.env.AEAT_ENVIRONMENT === "production",
}) => {
  const baseUrl = isProduction
    ? "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?"
    : "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?"

  const cleanNif = String(nif).trim().toUpperCase()
  const cleanNumSerie = encodeURIComponent(String(numSerie).trim())
  const cleanFecha = String(fechaExpedicion).trim()
  const cleanImporte = typeof importeTotal === "number" ? importeTotal.toFixed(2) : String(importeTotal).trim()

  return `${baseUrl}nif=${cleanNif}&numserie=${cleanNumSerie}&fecha=${cleanFecha}&importe=${cleanImporte}`
}

/**
 * Genera el código QR en Data URL base64 (PNG) con nivel M de corrección de error
 * conforme al Art. 21 de la Orden HAC/1177/2024 (ISO/IEC 18004).
 *
 * @param {string} qrUrl - URL de cotejo a codificar
 * @returns {Promise<string>} Data URL base64 de la imagen PNG
 */
export const generateQrDataUrl = async (qrUrl) => {
  if (!qrUrl) return ""
  try {
    return await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 256,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
  } catch (err) {
    console.error("Error generating Verifactu QR Code:", err)
    return ""
  }
}

export default {
  formatDateAeat,
  getIsoDateTimeWithTimezone,
  buildHashInputString,
  computeInvoiceHash,
  buildAeatQrUrl,
  generateQrDataUrl,
}
