import { User, Invoice } from "../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"

function getInvoice(userId, invoiceid) {
  validate.id(userId, "userId")
  validate.id(invoiceid, "invoiceId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Invoice.findById(invoiceid).populate("customer").populate("company").populate({ path: "deliveryNotes", populate: { path: "works" } }).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(invoice => {
          if (!invoice) {
            throw new NotFoundError("Invoice not found")
          }
          invoice.id = invoice._id.toString()
          delete invoice._id

          return invoice
        })
    })
}

export default getInvoice