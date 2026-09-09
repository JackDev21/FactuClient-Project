import validate from "com/validate.js"
import { User, DeliveryNote, Invoice } from "../../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const parseDeliveryNoteNumber = (numStr) => {
  if (!numStr) return { year: 0, seq: 0 }
  if (numStr.startsWith("ALB-")) {
    const parts = numStr.split("-")
    return { year: parseInt(parts[1]) || 0, seq: parseInt(parts[2]) || 0 }
  }
  if (numStr.includes("/")) {
    const parts = numStr.split("/")
    return { year: parseInt(parts[0]) || 0, seq: parseInt(parts[1]) || 0 }
  }
  return { year: 0, seq: parseInt(numStr) || 0 }
}

const getAllDeliveryNotes = (userId) => {
  validate.id(userId, "userId")

  return User.findById(userId)
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Promise.all([
        DeliveryNote.find({ company: userId }).populate("customer", "username companyName").sort({ number: -1 }).select("-__v").lean(),
        Invoice.find({ company: userId }).select("deliveryNotes number").lean()
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
                deliveryNote.customerName = deliveryNote.customer?.companyName || deliveryNote.customer?.username

                return deliveryNote
              })

              if (outOfSyncIdsToFix.length > 0) {
                DeliveryNote.updateMany({ _id: { $in: outOfSyncIdsToFix } }, { $set: { isInvoiced: false } }).catch(() => {})
              }
              if (outOfSyncInvoicedIdsToFix.length > 0) {
                DeliveryNote.updateMany({ _id: { $in: outOfSyncInvoicedIdsToFix } }, { $set: { isInvoiced: true } }).catch(() => {})
              }

              mappedNotes.sort((a, b) => {
                const numA = parseDeliveryNoteNumber(a.number)
                const numB = parseDeliveryNoteNumber(b.number)
                if (numB.year !== numA.year) {
                  return numB.year - numA.year
                }
                return numB.seq - numA.seq
              })

              return mappedNotes
            })
        })
}

export default getAllDeliveryNotes
