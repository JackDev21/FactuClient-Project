import { User, Invoice } from "../../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"

const parseInvoiceNumber = (numStr) => {
  if (!numStr) return { year: 0, seq: 0 }
  if (numStr.startsWith("FRA-")) {
    const parts = numStr.split("-")
    return { year: parseInt(parts[1]) || 0, seq: parseInt(parts[2]) || 0 }
  }
  if (numStr.includes("/")) {
    const parts = numStr.split("/")
    return { year: parseInt(parts[0]) || 0, seq: parseInt(parts[1]) || 0 }
  }
  return { year: 0, seq: parseInt(numStr) || 0 }
}

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

          const isSelf = userId === customerId
          const isManager = customer.manager && customer.manager.toString() === userId

          if (!isSelf && !isManager) {
            throw new MatchError("Can not access invoices from another customer")
          }

          return Invoice.find({ customer: customerId })
            .populate("customer")
            .populate("company")
            .populate({ path: "deliveryNotes", populate: { path: "works" } })
            .lean()
            .catch(error => { throw new SystemError(error.message) })
            .then(invoices => {
              if (!invoices.length) {
                throw new NotFoundError("Invoices not found")
              }

              invoices.forEach(invoice => {
                invoice.id = invoice._id.toString()
                delete invoice._id
              })

              // Ordenación numérica secuencial descendente
              invoices.sort((a, b) => {
                const na = parseInvoiceNumber(a.number)
                const nb = parseInvoiceNumber(b.number)

                if (na.year !== nb.year) {
                  return nb.year - na.year
                }
                return nb.seq - na.seq
              })

              return invoices
            })
        })
    })
}

export default getAllInvoicesCustomer