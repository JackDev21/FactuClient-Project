import validate from "com/validate.js"
import { User, Invoice } from "../model/index.js"
import { MatchError, NotFoundError, SystemError } from "com/errors.js"

const deleteInvoice = (userId, invoiceId) => {
  validate.id(userId, "userId")
  validate.id(invoiceId, "invoiceId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Invoice.findById(invoiceId).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then((invoice) => {
          if (!invoice) {
            throw new NotFoundError("Invoice not found")
          }

          if (invoice.company.toString() !== userId) {
            throw new MatchError("Can not delete Invoice from another company")
          }

          return Invoice.deleteOne({ _id: invoiceId })
            .catch(error => { throw new SystemError(error.message) })
            .then(() => { })
        })

    })
}

export default deleteInvoice