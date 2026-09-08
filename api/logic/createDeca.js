import path from "path"
import { v4 as uuidv4 } from "uuid"
import validate from "com/validate.js"
import { NotFoundError, SystemError, DuplicityError, MatchError } from "com/errors.js"
import { User, DeliveryNote, Deca } from "../model/index.js"
import generateDecaPdf from "./generateDecaPdf.js"

const getNextDecaSeq = (allDecas, currentYear) => {
  let maxNumber = 0
  allDecas.forEach((d) => {
    const num = d.number || ""
    if (num.includes("/")) {
      const parts = num.replace("DECA-", "").split("/")
      const year = parseInt(parts[0])
      const seq = parseInt(parts[1])
      if (year === currentYear && seq > maxNumber) {
        maxNumber = seq
      }
    }
  })
  return maxNumber + 1
}

const formatDecaNumber = (year, seq) => `DECA-${year}/${String(seq).padStart(3, "0")}`

/**
 * Crea un nuevo DeCA asociado a un albarán existente, genera su PDF con QR y guarda el registro.
 */
const createDeca = async (userId, deliveryNoteId, decaData) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")

  if (!decaData) {
    throw new MatchError("Datos del DeCA requeridos")
  }

  // Validaciones mínimas según Art. 6 FOM/2861/2012
  if (!decaData.shipper?.name || !decaData.shipper?.taxId || !decaData.shipper?.address) {
    throw new MatchError("Los datos del cargador contractual (nombre, NIF y domicilio) son obligatorios")
  }
  if (!decaData.carrier?.name || !decaData.carrier?.taxId) {
    throw new MatchError("Los datos del transportista efectivo (nombre y NIF) son obligatorios")
  }
  if (!decaData.origin || !decaData.origin.trim()) {
    throw new MatchError("El lugar de origen (carga) es obligatorio")
  }
  if (!decaData.destination || !decaData.destination.trim()) {
    throw new MatchError("El lugar de destino (descarga) es obligatorio")
  }
  if (!decaData.cargoDescription || !decaData.cargoDescription.trim()) {
    throw new MatchError("La descripción o naturaleza de la mercancía es obligatoria")
  }
  if (!decaData.cargoWeight || !String(decaData.cargoWeight).trim()) {
    throw new MatchError("El peso o cantidad de la mercancía es obligatorio")
  }

  // 1. Verificar usuario emisor
  const user = await User.findById(userId).lean().catch((err) => {
    throw new SystemError(err.message)
  })
  if (!user) throw new NotFoundError("Usuario no encontrado")

  // 2. Verificar albarán
  const deliveryNote = await DeliveryNote.findById(deliveryNoteId)
    .populate("works")
    .populate("customer")
    .populate("company")
    .lean()
    .catch((err) => {
      throw new SystemError(err.message)
    })

  if (!deliveryNote) throw new NotFoundError("Albarán no encontrado")
  if (deliveryNote.company._id.toString() !== userId) {
    throw new MatchError("No tienes permiso para emitir DeCA sobre este albarán")
  }

  // 3. Comprobar si ya existe un DeCA para este albarán
  const existingDeca = await Deca.findOne({ deliveryNote: deliveryNoteId }).lean().catch((err) => {
    throw new SystemError(err.message)
  })
  if (existingDeca) {
    throw new DuplicityError("Ya existe un DeCA emitido para este albarán")
  }

  // 4. Generar número correlativo
  const currentYear = new Date().getFullYear()
  const allDecas = await Deca.find({ company: userId }).select("number").lean().catch((err) => {
    throw new SystemError(err.message)
  })
  const nextSeq = getNextDecaSeq(allDecas, currentYear)
  const decaNumber = formatDecaNumber(currentYear, nextSeq)

  // 5. Generar token público para la inspección
  const publicToken = uuidv4()
  const sanitizedNumber = decaNumber.replace(/[\/\\]/g, "-")
  const pdfFilename = `${sanitizedNumber}_${publicToken.slice(0, 8)}.pdf`

  // Ruta física del PDF
  const uploadsDir = path.resolve(process.cwd(), "uploads", "deca", userId)
  const pdfPath = path.join(uploadsDir, pdfFilename)

  // URL pública de inspección (directa sin credenciales)
  const port = process.env.PORT || 7070
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`
  const publicDownloadUrl = `${baseUrl}/deca/public/${publicToken}/download`

  const generatedAt = new Date()
  // Retención mínima legal: 1 año (365 días)
  const retainUntil = new Date(generatedAt.getTime() + 365 * 24 * 60 * 60 * 1000)

  // 6. Estructurar documento completo para generación de PDF y guardado
  const fullDecaData = {
    number: decaNumber,
    generatedAt,
    deliveryNote,
    deliveryNoteNumber: deliveryNote.number,
    company: userId,
    customer: deliveryNote.customer._id || deliveryNote.customer,
    shipper: {
      name: decaData.shipper.name.trim(),
      taxId: decaData.shipper.taxId.trim().toUpperCase(),
      address: decaData.shipper.address.trim(),
    },
    carrier: {
      name: decaData.carrier.name.trim(),
      taxId: decaData.carrier.taxId.trim().toUpperCase(),
      address: decaData.carrier.address?.trim() || "",
    },
    origin: decaData.origin.trim(),
    destination: decaData.destination.trim(),
    cargoDescription: decaData.cargoDescription.trim(),
    cargoWeight: String(decaData.cargoWeight).trim(),
    vehiclePlate: (decaData.vehiclePlate || "").trim().toUpperCase(),
    trailerPlate: (decaData.trailerPlate || "").trim().toUpperCase(),
    driverName: (decaData.driverName || "").trim(),
    transportDate: decaData.transportDate ? new Date(decaData.transportDate) : generatedAt,
    pdfFilename,
    pdfPath,
    publicToken,
    status: "active",
    retainUntil,
    observations: (decaData.observations || "").trim(),
    modificationHistory: [
      {
        date: generatedAt,
        description: "Emisión inicial previa al transporte con registro digital oficial",
        modifiedFields: ["creation"],
      },
    ],
  }

  // 7. Generar el fichero PDF
  try {
    await generateDecaPdf(fullDecaData, pdfPath, publicDownloadUrl)
  } catch (err) {
    throw new SystemError(`Error al generar el PDF del DeCA: ${err.message}`)
  }

  // 8. Guardar en base de datos
  const decaDoc = await Deca.create(fullDecaData).catch((err) => {
    throw new SystemError(err.message)
  })

  // 9. Vincular al albarán
  await DeliveryNote.findByIdAndUpdate(deliveryNoteId, { deca: decaDoc._id }).catch(() => {})

  // Devolver objeto limpio
  const created = await Deca.findById(decaDoc._id)
    .populate("deliveryNote")
    .populate("customer")
    .populate("company")
    .select("-__v")
    .lean()

  created.id = created._id.toString()
  delete created._id
  created.publicDownloadUrl = publicDownloadUrl

  return created
}

export default createDeca
