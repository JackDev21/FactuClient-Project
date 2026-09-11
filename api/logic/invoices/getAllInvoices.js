import validate from "com/validate.js"
import { User, Invoice } from "../../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

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

const getAllInvoices = (userId) => {
  validate.id(userId, "userId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Invoice.find({ company: userId })
        .populate("company")
        .populate("customer")
        .populate({ path: "deliveryNotes", populate: { path: "works" } })
        .select("-__v")
        .lean()
        .catch(error => { throw new SystemError(error.message) })
        .then((invoices) => {
          if (!invoices.length) {
            throw new NotFoundError("Invoices not found")
          }

          invoices.forEach((invoice) => {
            invoice.id = invoice._id.toString()
            delete invoice._id

            // Calcular importe total con IVA e IRPF
            let subtotal = 0
            if (Array.isArray(invoice.deliveryNotes)) {
              invoice.deliveryNotes.forEach((dn) => {
                if (Array.isArray(dn?.works)) {
                  dn.works.forEach((w) => {
                    subtotal += (Number(w.quantity) || 0) * (Number(w.price) || 0)
                  })
                }
              })
            }
            const iva = subtotal * 0.21
            const irpfPercentage = Number(invoice.company?.irpf) || 0
            const irpfAmount = subtotal * (irpfPercentage / 100)
            invoice.subtotal = subtotal
            invoice.totalAmount = subtotal + iva - irpfAmount
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
}

export default getAllInvoices