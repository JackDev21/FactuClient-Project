import validate from "com/validate.js"
import { Invoice, User } from "../../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const updateInvoicePaymentType = (userId, invoiceId, paymentType) => {
  validate.id(userId, "userId")
  validate.id(invoiceId, "invoiceId")
  validate.text(paymentType, "paymentType")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) throw new NotFoundError("User not found")

      return Invoice.findOneAndUpdate(
        { _id: invoiceId, company: userId },
        { paymentType },
        { new: true, select: "-__v" }
      )
        .lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(updatedInvoice => {
          if (!updatedInvoice) throw new NotFoundError("Invoice not found")
          updatedInvoice.id = updatedInvoice._id.toString()
          delete updatedInvoice._id
          return updatedInvoice
        })
    })
}

export default updateInvoicePaymentType
