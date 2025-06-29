import validate from "com/validate.js"
import { Invoice } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const updateInvoiceDate = (userId, invoiceId, invoiceDate) => {
  validate.id(userId, "userId")
  validate.id(invoiceId, "invoiceId")
  validate.date(invoiceDate, "invoiceDate")

  // parse DD/MM/YYYY string to Date
  const [day, month, year] = invoiceDate.split("/").map(Number)
  const dateObj = new Date(year, month - 1, day)
  console.log("updateInvoiceDate: received formated string=", invoiceDate, "parsed Date=", dateObj)
  return Invoice.findOneAndUpdate(
    { _id: invoiceId, company: userId },
    { date: dateObj },
    { new: true, select: "-__v" }
  )
    .catch(error => { throw new SystemError(error.message) })
    .then(updated => {
      if (!updated) throw new NotFoundError("Invoice not found")
      return updated
    })
}

export default updateInvoiceDate
