import fs from "fs"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { Deca } from "../model/index.js"

/**
 * Obtiene el fichero y metadatos de un DeCA a través de su token público de inspección
 * (Acceso sin autenticación para Guardia Civil / Servicios de Inspección).
 */
const getDecaByToken = async (publicToken) => {
  if (!publicToken || typeof publicToken !== "string") {
    throw new MatchError("Token público de inspección inválido")
  }

  const deca = await Deca.findOne({ publicToken })
    .select("-__v")
    .lean()
    .catch((err) => {
      throw new SystemError(err.message)
    })

  if (!deca) {
    throw new NotFoundError("Documento DeCA no encontrado o identificador no válido")
  }

  // Comprobar si ha expirado la descarga pública (7 días naturales tras la entrega)
  if (deca.publicAccessExpiry && new Date() > new Date(deca.publicAccessExpiry)) {
    throw new MatchError(
      "El periodo de acceso público directo para inspección en carretera ha expirado (7 días naturales tras la finalización del transporte). Solicite el documento a la empresa emisora para inspección diferida."
    )
  }

  if (!fs.existsSync(deca.pdfPath)) {
    throw new NotFoundError("El archivo PDF del DeCA no está disponible en el servidor")
  }

  return {
    pdfPath: deca.pdfPath,
    pdfFilename: deca.pdfFilename,
    number: deca.number,
    status: deca.status,
  }
}

export default getDecaByToken
