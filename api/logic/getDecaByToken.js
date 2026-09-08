import fs from "fs"
import path from "path"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { Deca } from "../model/index.js"
import generateDecaPdf from "./generateDecaPdf.js"
import getBaseUrl from "../utils/getBaseUrl.js"

/**
 * Obtiene el fichero y metadatos de un DeCA a través de su token público de inspección
 * (Acceso sin autenticación para Guardia Civil / Servicios de Inspección).
 * Si el archivo PDF no se encuentra físicamente en el servidor (por ejemplo debido a reinicio de
 * contenedores efímeros en Render o rutas entre diferentes entornos), se regenera al vuelo con los datos de MongoDB.
 */
const getDecaByToken = async (publicToken, customBaseUrl) => {
  if (!publicToken || typeof publicToken !== "string") {
    throw new MatchError("Token público de inspección inválido")
  }

  const deca = await Deca.findOne({ publicToken })
    .populate({
      path: "deliveryNote",
      populate: { path: "works" },
    })
    .populate("customer")
    .populate("company")
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

  // Normalizar ruta física en el sistema de archivos del servidor actual
  const userId = deca.company?._id?.toString() || deca.company?.toString() || "shared"
  const uploadsDir = path.resolve(process.cwd(), "uploads", "deca", userId)
  const sanitizedFilename = deca.pdfFilename || `DECA_${(deca.number || "DOC").replace(/[\/\\]/g, "-")}.pdf`
  const localPdfPath = path.join(uploadsDir, sanitizedFilename)

  let finalPdfPath = deca.pdfPath && fs.existsSync(deca.pdfPath) ? deca.pdfPath : localPdfPath

  // Si no existe físicamente en el disco, regenerar al vuelo a partir de los datos en MongoDB
  if (!fs.existsSync(finalPdfPath)) {
    const baseUrl = getBaseUrl(null, customBaseUrl)
    const publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`

    await generateDecaPdf(deca, localPdfPath, publicDownloadUrl)
    finalPdfPath = localPdfPath
  }

  return {
    pdfPath: finalPdfPath,
    pdfFilename: sanitizedFilename,
    number: deca.number,
    status: deca.status,
  }
}

export default getDecaByToken
