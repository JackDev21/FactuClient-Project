import { Invoice } from "../model/index.js"

const updateInvoicePaymentType = (invoiceId, paymentType) => {
  if (!invoiceId) throw new Error("Invoice ID is required")
  if (!paymentType) throw new Error("Payment type is required")
  return Invoice.findByIdAndUpdate(
    invoiceId,
    { paymentType },
    { new: true }
  )
    .select("-__v")
    .lean()
}

export default updateInvoicePaymentType
