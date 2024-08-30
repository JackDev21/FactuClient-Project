import { User, Invoice } from "../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"

const getAllInvoicesCustomer = (userId, customerId) => {
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

          return Invoice.find({ customer: customerId }).populate("customer").populate("company").populate({ path: "deliveryNotes", populate: { path: "works" } }).sort({ date: -1 }).lean()
            .catch(error => { throw new SystemError(error.message) })
            .then(invoices => {
              if (!invoices.length) {
                throw new NotFoundError("Invoices not found")
              }


              invoices.forEach(invoice => {
                invoice.id = invoice._id.toString()
                delete invoice._id
              })

              return invoices
            })
        })
    })
}

export default getAllInvoicesCustomer