import validate from "com/validate.js"
import { User, Invoice, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError, DuplicityError } from "com/errors.js"

const createInvoice = (userId, customerId, deliveryNoteIds = [], invoiceDate) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Invoice.find({ company: userId }).select("number").lean()
        .then(allInvoices => {
          const currentYear = new Date().getFullYear()

          // Extraer el número secuencial más alto de cualquier formato (FRA-2026-0016 o 2026/001)
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

          const nextInvoiceNumber = maxNumber + 1
          const invoiceNumber = `${currentYear}/${String(nextInvoiceNumber).padStart(3, '0')}`

          // Si hay albaranes seleccionados, validar que existan y no estén ya facturados
          const validateDeliveryNotes = (deliveryNoteIds && deliveryNoteIds.length > 0)
            ? Promise.all([
                DeliveryNote.find({ _id: { $in: deliveryNoteIds } }).lean(),
                Invoice.find({ deliveryNotes: { $in: deliveryNoteIds } }).select("_id number").lean()
              ]).then(([dns, existingInvs]) => {
                if (dns.length !== deliveryNoteIds.length) {
                  throw new NotFoundError("One or more delivery notes not found")
                }
                if (existingInvs.length > 0 || dns.some(d => d.isInvoiced)) {
                  throw new DuplicityError("Uno o más albaranes seleccionados ya están facturados")
                }
              })
            : Promise.resolve()

          return validateDeliveryNotes.then(() => {
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
              .catch(error => { throw new SystemError(error.message) })
              .then((invoice) => {
                const updateDns = (deliveryNoteIds && deliveryNoteIds.length > 0)
                  ? DeliveryNote.updateMany({ _id: { $in: deliveryNoteIds } }, { $set: { isInvoiced: true } })
                  : Promise.resolve()

                return updateDns
                  .catch(error => { throw new SystemError(error.message) })
                  .then(() => {
                    return Invoice.findById(invoice.id).select("-__v").populate("customer").populate("company").populate("deliveryNotes").lean()
                      .then((invoice) => invoice)
                  })
              })
          })
        })
    })
}

export default createInvoice