import validate from "com/validate.js"
import { User, Invoice } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const getAllInvoices = (userId) => {
  validate.id(userId, "userId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Invoice.find({ company: userId }).populate("company").populate("customer").sort({ date: -1 }).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then((invoices) => {

          if (!invoices.length) {
            throw new NotFoundError("Invoices not found")
          }

          invoices.forEach((invoice) => {
            invoice.id = invoice._id.toString()
            delete invoice._id
          })

          return invoices
        })
    })
}
export default getAllInvoices