import { User, Invoice } from "../../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { formatDateAeat, buildAeatQrUrl, generateQrDataUrl } from "../../utils/verifactuCrypto.js"

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

          const isCompany = invoice.company && (invoice.company._id?.toString() === userId || invoice.company.toString() === userId)
          const isCustomer = invoice.customer && (invoice.customer._id?.toString() === userId || invoice.customer.toString() === userId)
          const isCompanyDriver = user.role === "driver" && user.manager && (invoice.company._id?.toString() === user.manager.toString() || invoice.company.toString() === user.manager.toString())

          if (!isCompany && !isCustomer && !isCompanyDriver) {
            throw new MatchError("Can not access invoice from another company")
          }

          invoice.id = invoice._id.toString()
          delete invoice._id

          // Retrocompatibilidad: Si la factura no tenía QR generado, calcularlo
          if (!invoice.qrUrl && invoice.number && invoice.date) {
            const companyNif = invoice.company?.taxId || ""
            let total = 0
            if (Array.isArray(invoice.deliveryNotes)) {
              invoice.deliveryNotes.forEach((dn) => {
                if (Array.isArray(dn?.works)) {
                  dn.works.forEach((w) => {
                    total += (Number(w.quantity) || 0) * (Number(w.price) || 0)
                  })
                }
              })
            }
            const iva = total * 0.21
            const irpfPercentage = Number(invoice.company?.irpf) || 0
            const irpfAmount = total * (irpfPercentage / 100)
            const totalWithTax = total + iva - irpfAmount

            invoice.qrUrl = buildAeatQrUrl({
              nif: companyNif,
              numSerie: invoice.number,
              fechaExpedicion: formatDateAeat(invoice.date),
              importeTotal: totalWithTax,
            })
          }

          if (!invoice.qrDataUrl && invoice.qrUrl) {
            return generateQrDataUrl(invoice.qrUrl).then(dataUrl => {
              invoice.qrDataUrl = dataUrl
              return invoice
            })
          }

          return invoice
        })
    })
}

export default getInvoice