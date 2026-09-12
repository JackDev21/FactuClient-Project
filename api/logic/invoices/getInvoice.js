import { User, Invoice } from "../../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import {
  formatDateAeat,
  buildAeatQrUrl,
  generateQrDataUrl,
  computeInvoiceHash,
  getIsoDateTimeWithTimezone,
} from "../../utils/verifactuCrypto.js"

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
        .then(async invoice => {
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

          // Retrocompatibilidad: Si la factura no tenía campos de Veri*factu generados, calcularlos y persistirlos
          let base = Number(invoice.baseAmount) || 0
          let iva = Number(invoice.taxAmount) || 0
          let irpfAmount = Number(invoice.irpfAmount) || 0
          let total = Number(invoice.totalAmount) || 0

          if (!invoice.baseAmount && Array.isArray(invoice.deliveryNotes)) {
            base = 0
            invoice.deliveryNotes.forEach((dn) => {
              if (Array.isArray(dn?.works)) {
                dn.works.forEach((w) => {
                  base += (Number(w.quantity) || 0) * (Number(w.price) || 0)
                })
              }
            })
            iva = base * 0.21
            const irpfPercentage = Number(invoice.company?.irpf) || 0
            irpfAmount = base * (irpfPercentage / 100)
            total = base + iva - irpfAmount
            invoice.baseAmount = base
            invoice.taxAmount = iva
            invoice.irpfAmount = irpfAmount
            invoice.totalAmount = total
          }

          if (!invoice.tipoFactura) {
            invoice.tipoFactura = "F1"
          }

          if (!invoice.fechaHoraHusoGenRegistro) {
            invoice.fechaHoraHusoGenRegistro = getIsoDateTimeWithTimezone(invoice.date || new Date())
          }

          if (!invoice.huella && invoice.number && invoice.date) {
            const companyNif = invoice.company?.taxId || ""
            const fechaExpedicion = formatDateAeat(invoice.date)
            const huellaAnterior = invoice.huellaAnterior || ""
            invoice.huella = computeInvoiceHash({
              nif: companyNif,
              numSerie: invoice.number,
              fechaExpedicion,
              tipoFactura: invoice.tipoFactura || "F1",
              cuotaTotal: iva,
              importeTotal: total,
              huellaAnterior,
              fechaHoraHusoGenRegistro: invoice.fechaHoraHusoGenRegistro,
            })
          }

          if (!invoice.qrUrl && invoice.number && invoice.date) {
            const companyNif = invoice.company?.taxId || ""
            invoice.qrUrl = buildAeatQrUrl({
              nif: companyNif,
              numSerie: invoice.number,
              fechaExpedicion: formatDateAeat(invoice.date),
              importeTotal: total,
            })
          }

          if (!invoice.qrDataUrl && invoice.qrUrl) {
            invoice.qrDataUrl = await generateQrDataUrl(invoice.qrUrl)
          }

          if (!invoice.verifactuStatus) {
            invoice.verifactuStatus = "GENERATED"
          }

          // Persistir en segundo plano para que quede grabado de forma definitiva
          Invoice.updateOne(
            { _id: invoice.id, huella: { $exists: false } },
            {
              $set: {
                baseAmount: invoice.baseAmount,
                taxAmount: invoice.taxAmount,
                irpfAmount: invoice.irpfAmount,
                totalAmount: invoice.totalAmount,
                tipoFactura: invoice.tipoFactura,
                fechaHoraHusoGenRegistro: invoice.fechaHoraHusoGenRegistro,
                huella: invoice.huella,
                qrUrl: invoice.qrUrl,
                qrDataUrl: invoice.qrDataUrl,
                verifactuStatus: invoice.verifactuStatus,
              },
            }
          ).catch(() => {})

          return invoice
        })
    })
}

export default getInvoice