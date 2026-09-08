import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { Deca } from "../model/index.js"
import generateDecaPdf from "./generateDecaPdf.js"

/**
 * Modifica datos operativos de un DeCA en curso registrando la trazabilidad exigida por la Resolución de 5 de junio de 2026.
 */
const updateDeca = async (userId, decaId, updates, reason = "Actualización de datos durante el transporte") => {
  validate.id(userId, "userId")
  validate.id(decaId, "decaId")

  if (!updates || typeof updates !== "object") {
    throw new MatchError("Datos a actualizar requeridos")
  }

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

  const modifiedFields = []

  if (updates.origin && updates.origin.trim() !== deca.origin) {
    deca.origin = updates.origin.trim()
    modifiedFields.push("origin")
  }
  if (updates.destination && updates.destination.trim() !== deca.destination) {
    deca.destination = updates.destination.trim()
    modifiedFields.push("destination")
  }
  if (updates.cargoDescription && updates.cargoDescription.trim() !== deca.cargoDescription) {
    deca.cargoDescription = updates.cargoDescription.trim()
    modifiedFields.push("cargoDescription")
  }
  if (updates.cargoWeight && String(updates.cargoWeight).trim() !== deca.cargoWeight) {
    deca.cargoWeight = String(updates.cargoWeight).trim()
    modifiedFields.push("cargoWeight")
  }
  if (updates.vehiclePlate !== undefined && updates.vehiclePlate.trim().toUpperCase() !== deca.vehiclePlate) {
    deca.vehiclePlate = updates.vehiclePlate.trim().toUpperCase()
    modifiedFields.push("vehiclePlate")
  }
  if (updates.trailerPlate !== undefined && updates.trailerPlate.trim().toUpperCase() !== deca.trailerPlate) {
    deca.trailerPlate = updates.trailerPlate.trim().toUpperCase()
    modifiedFields.push("trailerPlate")
  }
  if (updates.driverName !== undefined && updates.driverName.trim() !== deca.driverName) {
    deca.driverName = updates.driverName.trim()
    modifiedFields.push("driverName")
  }
  if (updates.observations !== undefined && updates.observations.trim() !== deca.observations) {
    deca.observations = updates.observations.trim()
    modifiedFields.push("observations")
  }

  if (modifiedFields.length === 0) {
    return deca
  }

  deca.modificationHistory.push({
    date: new Date(),
    description: reason.trim(),
    modifiedFields,
  })

  await deca.save().catch((err) => {
    throw new SystemError(err.message)
  })

  // Regenerar PDF actualizado
  const port = process.env.PORT || 7070
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`
  const publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`

  try {
    await generateDecaPdf(deca.toObject(), deca.pdfPath, publicDownloadUrl)
  } catch (err) {
    console.error("Error al regenerar PDF tras modificación:", err)
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

export default updateDeca
