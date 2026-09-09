import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { Deca } from "../../model/index.js"
import generateDecaPdf from "./generateDecaPdf.js"
import getBaseUrl from "../../utils/getBaseUrl.js"

/**
 * Registra la finalización del transporte, estableciendo el plazo de 7 días naturales
 * para el acceso público de inspección conforme a la normativa.
 */
const updateDecaTransportEnd = async (userId, decaId, customBaseUrl) => {
  validate.id(userId, "userId")
  validate.id(decaId, "decaId")

  const deca = await Deca.findOne({ _id: decaId, company: userId })
    .populate({
      path: "deliveryNote",
      populate: { path: "works" },
    })
    .catch((err) => {
      throw new SystemError(err.message)
    })

  if (!deca) {
    throw new NotFoundError("DeCA no encontrado")
  }

  const now = new Date()
  // 7 días naturales tras la entrega
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  deca.status = "completed"
  deca.transportEndDate = now
  deca.publicAccessExpiry = expiryDate

  deca.modificationHistory.push({
    date: now,
    description: "Finalización del servicio de transporte registrada. Activada cuenta atrás legal de 7 días naturales para descarga pública por QR.",
    modifiedFields: ["status", "transportEndDate", "publicAccessExpiry"],
  })

  await deca.save().catch((err) => {
    throw new SystemError(err.message)
  })

  // Regenerar el PDF con el estado actualizado
  const baseUrl = getBaseUrl(null, customBaseUrl)
  const publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`

  try {
    await generateDecaPdf(deca.toObject(), deca.pdfPath, publicDownloadUrl)
  } catch (err) {
    // Si falla la regeneración del PDF, no impedimos la actualización en BD
    console.error("Error al actualizar PDF tras fin de transporte:", err)
  }

  const updated = await Deca.findById(deca._id)
    .populate("deliveryNote")
    .populate("customer")
    .populate("company")
    .select("-__v")
    .lean()

  updated.id = updated._id.toString()
  delete updated._id
  updated.publicDownloadUrl = publicDownloadUrl

  return updated
}

export default updateDecaTransportEnd
