import validate from "com/validate.js"
import { User, Invoice, DeliveryNote } from "../../model/index.js"
import { NotFoundError, SystemError, DuplicityError } from "com/errors.js"

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

      return reserveDeliveryNotes().then(() => {
        const attemptCreate = (retryCount = 0) => {
          return Invoice.find({ company: userId }).select("number").lean()
            .then(allInvoices => {
              const nextSeq = getNextInvoiceSeq(allInvoices, currentYear)
              const invoiceNumber = formatInvoiceNumber(currentYear, nextSeq)

              const newInvoice = {
                date: invoiceDate ? new Date(invoiceDate) : new Date(),
                number: invoiceNumber,
                company: userId,
                customer: customerId,
                deliveryNotes: deliveryNoteIds,
                observations: "",
                paymentType: "Transferencia",
              }

              return Invoice.create(newInvoice)
                .then(invoice => {
                  return Invoice.findById(invoice.id)
                    .select("-__v")
                    .populate("customer")
                    .populate("company")
                    .populate("deliveryNotes")
                    .lean()
                    .then(invoice => invoice)
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