import logic from "../logic/index.js"
import getBaseUrl from "../utils/getBaseUrl.js"

/**
 * Endpoint público para inspección en carretera por la Guardia Civil / Inspectores de Transporte.
 * Permite la descarga y visualización directa del PDF original sin usuario ni contraseña,
 * conforme a la Resolución de 5 de junio de 2026.
 */
export default (req, res, next) => {
  try {
    const { publicToken } = req.params
    const baseUrl = getBaseUrl(req)

    logic.getDecaByToken(publicToken, baseUrl)
      .then(({ pdfPath, pdfFilename }) => {
        // Enviar cabeceras HTTP para visualización y descarga inmediata
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `inline; filename="${pdfFilename}"`)
        res.sendFile(pdfPath)
      })
      .catch((error) => next(error))
  } catch (error) {
    next(error)
  }
}
