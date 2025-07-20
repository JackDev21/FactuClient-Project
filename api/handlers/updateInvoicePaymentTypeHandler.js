import updateInvoicePaymentType from "../logic/updateInvoicePaymentType.js"

export default async function updateInvoicePaymentTypeHandler(req, res) {
  try {
    const { invoiceId } = req.params
    const { paymentType } = req.body
    const updatedInvoice = await updateInvoicePaymentType(invoiceId, paymentType)
    res.json(updatedInvoice)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
