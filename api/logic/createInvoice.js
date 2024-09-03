import validate from "com/validate.js"
import { User, Invoice, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const createInvoice = (userId, customerId, deliveryNoteIds) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")


  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }


      return Invoice.findOne({ company: userId }).sort({ number: -1 }).select("-__v").lean()
        .then(lastInvoice => {
          const currentYear = new Date().getFullYear()
          //const currentYear = 2025 // prueba con año 2025 para ver si modifica la factura 

          let nextInvoiceNumber = 1

          if (lastInvoice) {
            const [lastYear, lastNumber] = lastInvoice.number.split("/") // ["2024", "001"]

            if (currentYear === parseInt(lastYear)) {

              nextInvoiceNumber = parseInt(lastNumber) + 1
            } else {
              nextInvoiceNumber = 1
            }
          }

          const invoiceNumber = `${currentYear}/${String(nextInvoiceNumber).padStart(3, '0')}`

          return Invoice.findOne({ number: invoiceNumber, company: userId }).select("-__v").lean()
            .then(() => {
              const newInvoice = {
                date: new Date(),
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
                  return DeliveryNote.updateMany({ _id: { $in: deliveryNoteIds } }, { $set: { isInvoiced: true } })
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