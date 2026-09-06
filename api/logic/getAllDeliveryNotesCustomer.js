import { User, DeliveryNote, Invoice } from "../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"

function getAllDeliveryNotesCustomer(userId, customerId) {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return User.findById(customerId).lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(customer => {
          if (!customer) {
            throw new NotFoundError("Customer not found")
          }

          return Promise.all([
            DeliveryNote.find({ customer: customerId }).populate("customer").populate("company").populate("works").sort({ date: -1 }).select("-__v").lean(),
            Invoice.find({ customer: customerId }).select("deliveryNotes number").lean()
          ])
            .catch(error => { throw new SystemError(error.message) })
            .then(([deliveryNotes, invoices]) => {
              if (!deliveryNotes.length) {
                throw new NotFoundError("DeliveryNotes not found")
              }

              const activeInvoiceMap = new Map()
              invoices.forEach(inv => {
                (inv.deliveryNotes || []).forEach(dnId => {
                  activeInvoiceMap.set(dnId.toString(), inv.number)
                })
              })

              const outOfSyncIdsToFix = []
              const outOfSyncInvoicedIdsToFix = []

              const mappedNotes = deliveryNotes.map(deliveryNote => {
                const dnIdStr = deliveryNote._id.toString()
                deliveryNote.id = dnIdStr
                delete deliveryNote._id

                const invoiceNumber = activeInvoiceMap.get(dnIdStr)
                const isReallyInvoiced = !!invoiceNumber

                if (deliveryNote.isInvoiced !== isReallyInvoiced) {
                  if (isReallyInvoiced) {
                    outOfSyncInvoicedIdsToFix.push(dnIdStr)
                  } else {
                    outOfSyncIdsToFix.push(dnIdStr)
                  }
                }

                deliveryNote.isInvoiced = isReallyInvoiced
                deliveryNote.invoiceNumber = invoiceNumber || null

                return deliveryNote
              })

              if (outOfSyncIdsToFix.length > 0) {
                DeliveryNote.updateMany({ _id: { $in: outOfSyncIdsToFix } }, { $set: { isInvoiced: false } }).catch(() => {})
              }
              if (outOfSyncInvoicedIdsToFix.length > 0) {
                DeliveryNote.updateMany({ _id: { $in: outOfSyncInvoicedIdsToFix } }, { $set: { isInvoiced: true } }).catch(() => {})
              }

              return mappedNotes
            })
        })
    })
}

export default getAllDeliveryNotesCustomer