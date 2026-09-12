import validate from "com/validate.js"
import { User, Invoice, DeliveryNote } from "../../model/index.js"
import { NotFoundError, SystemError, DuplicityError, CredentialsError } from "com/errors.js"
import {
  formatDateAeat,
  getIsoDateTimeWithTimezone,
  computeInvoiceHash,
  buildAeatQrUrl,
  generateQrDataUrl,
} from "../../utils/verifactuCrypto.js"

const MAX_RETRIES = 5

const getNextInvoiceSeq = (allInvoices, currentYear) => {
  let maxNumber = 0
  allInvoices.forEach(inv => {
    const num = inv.number || ""
    let year, seq

    if (num.startsWith("FRA-")) {
      const parts = num.split("-")
      year = parseInt(parts[1])
      seq = parseInt(parts[2])
    } else if (num.includes("/")) {
      const parts = num.split("/")
      year = parseInt(parts[0])
      seq = parseInt(parts[1])
    } else {
      return
    }

    if (year === currentYear && seq > maxNumber) {
      maxNumber = seq
    }
  })

  return maxNumber + 1
}

const formatInvoiceNumber = (year, seq) => `${year}/${String(seq).padStart(3, '0')}`

const createInvoice = (userId, customerId, deliveryNoteIds = [], invoiceDate) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      if (user.role === "driver" || user.role === "customer") {
        throw new CredentialsError("Only company owners can create invoices")
      }

      const currentYear = new Date().getFullYear()

      // 1. Validar y reservar albaranes de forma atómica (si se seleccionaron albaranes)
      const reserveDeliveryNotes = () => {
        if (!deliveryNoteIds || deliveryNoteIds.length === 0) {
          return Promise.resolve()
        }

        return Promise.all([
          DeliveryNote.find({ _id: { $in: deliveryNoteIds }, company: userId }).lean(),
          Invoice.find({ deliveryNotes: { $in: deliveryNoteIds } }).select("_id number").lean()
        ]).then(([dns, existingInvs]) => {
          if (dns.length !== deliveryNoteIds.length) {
            throw new NotFoundError("One or more delivery notes not found")
          }
          if (existingInvs.length > 0 || dns.some(d => d.isInvoiced)) {
            throw new DuplicityError("Uno o más albaranes seleccionados ya están facturados")
          }

          // Reserva atómica con condición: solo actualiza si isInvoiced sigue siendo false
          return DeliveryNote.updateMany(
            { _id: { $in: deliveryNoteIds }, isInvoiced: false },
            { $set: { isInvoiced: true } }
          ).then(res => {
            if (res.modifiedCount !== deliveryNoteIds.length) {
              // Rollback si alguno ya estaba facturado
              return DeliveryNote.updateMany(
                { _id: { $in: deliveryNoteIds } },
                { $set: { isInvoiced: false } }
              ).then(() => {
                throw new DuplicityError("Uno o más albaranes seleccionados ya están facturados")
              })
            }
          })
        })
      }

      // Rollback de albaranes en caso de fallo final
      const rollbackDeliveryNotes = () => {
        if (deliveryNoteIds && deliveryNoteIds.length > 0) {
          return DeliveryNote.updateMany(
            { _id: { $in: deliveryNoteIds } },
            { $set: { isInvoiced: false } }
          ).catch(() => {})
        }
        return Promise.resolve()
      }

      // 2. Calcular importes a partir de los albaranes y sus trabajos
      const calculateAmounts = () => {
        if (!deliveryNoteIds || deliveryNoteIds.length === 0) {
          return Promise.resolve({ baseAmount: 0, taxAmount: 0, irpfAmount: 0, totalAmount: 0 })
        }

        return DeliveryNote.find({ _id: { $in: deliveryNoteIds } })
          .populate("works")
          .lean()
          .then(dnsWithWorks => {
            const base = (dnsWithWorks || []).reduce((acc, dn) => {
              return (
                acc +
                (dn.works || []).reduce(
                  (sub, w) => sub + (Number(w.quantity) || 0) * (Number(w.price) || 0),
                  0
                )
              )
            }, 0)
            const baseAmount = Number(base.toFixed(2))
            const taxAmount = Number((baseAmount * 0.21).toFixed(2))
            const irpfPercentage = typeof user.irpf === "number" ? user.irpf : 0
            const irpfAmount = Number((baseAmount * (irpfPercentage / 100)).toFixed(2))
            const totalAmount = Number((baseAmount + taxAmount - irpfAmount).toFixed(2))

            return { baseAmount, taxAmount, irpfAmount, totalAmount }
          })
      }

      return reserveDeliveryNotes()
        .then(() => calculateAmounts())
        .then(amounts => {
          const attemptCreate = (retryCount = 0) => {
            return Invoice.find({ company: userId })
              .select("number huella _id")
              .sort({ _id: 1 })
              .lean()
              .then(async allInvoices => {
                const nextSeq = getNextInvoiceSeq(allInvoices, currentYear)
                const invoiceNumber = formatInvoiceNumber(currentYear, nextSeq)

                // Obtener la huella de la última factura previa de esta empresa para el encadenamiento
                const lastInvoice = allInvoices.length > 0 ? allInvoices[allInvoices.length - 1] : null
                const huellaAnterior = lastInvoice && lastInvoice.huella ? lastInvoice.huella : ""

                const invDate = invoiceDate ? new Date(invoiceDate) : new Date()
                const fechaExpedicion = formatDateAeat(invDate)
                const fechaHoraHusoGenRegistro = getIsoDateTimeWithTimezone(new Date())

                const nif = (user.taxId || "").trim().toUpperCase()

                // Cálculo del hash SHA-256 según Orden HAC/1177/2024
                const huella = computeInvoiceHash({
                  nif,
                  numSerie: invoiceNumber,
                  fechaExpedicion,
                  tipoFactura: "F1",
                  cuotaTotal: amounts.taxAmount,
                  importeTotal: amounts.totalAmount,
                  huellaAnterior,
                  fechaHoraHusoGenRegistro,
                })

                // Construcción de URL y generación de código QR oficial de la AEAT
                const qrUrl = buildAeatQrUrl({
                  nif,
                  numSerie: invoiceNumber,
                  fechaExpedicion,
                  importeTotal: amounts.totalAmount,
                })

                const qrDataUrl = await generateQrDataUrl(qrUrl)

                const newInvoice = {
                  date: invDate,
                  number: invoiceNumber,
                  company: userId,
                  customer: customerId,
                  deliveryNotes: deliveryNoteIds,
                  observations: "",
                  paymentType: "Transferencia",
                  baseAmount: amounts.baseAmount,
                  taxAmount: amounts.taxAmount,
                  irpfAmount: amounts.irpfAmount,
                  totalAmount: amounts.totalAmount,
                  huella,
                  huellaAnterior,
                  tipoFactura: "F1",
                  fechaHoraHusoGenRegistro,
                  qrUrl,
                  qrDataUrl,
                  verifactuStatus: "GENERATED",
                }

                return Invoice.create(newInvoice)
                  .then(invoice => {
                    return Invoice.findById(invoice.id)
                      .select("-__v")
                      .populate("customer")
                      .populate("company")
                      .populate({ path: "deliveryNotes", populate: { path: "works" } })
                      .lean()
                      .then(inv => {
                        inv.id = inv._id.toString()
                        delete inv._id
                        return inv
                      })
                  })
                  .catch(error => {
                    // Si es error de duplicado (11000) por colisión concurrente, reintentar con el siguiente número
                    if (error.code === 11000 && retryCount < MAX_RETRIES) {
                      return attemptCreate(retryCount + 1)
                    }
                    return rollbackDeliveryNotes().then(() => {
                      throw new SystemError(error.message)
                    })
                  })
              })
          }

          return attemptCreate().catch(error => {
            return rollbackDeliveryNotes().then(() => {
              throw error
            })
          })
        })
    })
}

export default createInvoice