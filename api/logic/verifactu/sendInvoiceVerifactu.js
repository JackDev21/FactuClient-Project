import validate from "com/validate.js"
import { User, Invoice } from "../../model/index.js"
import { NotFoundError, MatchError, SystemError, CredentialsError } from "com/errors.js"
import { buildAltaFacturaXml } from "../../utils/verifactuXmlBuilder.js"
import { sendToAeat } from "../../utils/verifactuClient.js"

/**
 * Remite telemáticamente un registro de facturación de alta a la sede electrónica de la AEAT
 * mediante el Web Service SOAP oficial con autenticación por certificado de cliente (mTLS).
 *
 * @param {string} userId - ID del usuario emisor (empresa/autónomo)
 * @param {string} invoiceId - ID de la factura a remitir
 * @param {Object} [options] - Opciones opcionales de conexión
 * @returns {Promise<{ invoice: Object, result: Object }>}
 */
const sendInvoiceVerifactu = (userId, invoiceId, options = {}) => {
  validate.id(userId, "userId")
  validate.id(invoiceId, "invoiceId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      if (user.role === "driver" || user.role === "customer") {
        throw new CredentialsError("Only company owners can remit invoices to AEAT")
      }

      return Invoice.findById(invoiceId)
        .populate("company")
        .populate("customer")
        .populate({ path: "deliveryNotes", populate: { path: "works" } })
        .then(async invoice => {
          if (!invoice) {
            throw new NotFoundError("Invoice not found")
          }

          const isCompany = invoice.company && (invoice.company._id?.toString() === userId || invoice.company.toString() === userId)
          if (!isCompany) {
            throw new MatchError("Can not remit invoice from another company")
          }

          // Generar el XML SOAP oficial de alta
          const xmlPayload = buildAltaFacturaXml(invoice)

          // Remitir a la AEAT mediante mTLS
          let result
          try {
            const sendFn = options.sendFn || sendToAeat
            result = await sendFn(xmlPayload, options)
          } catch (err) {
            invoice.verifactuStatus = "REJECTED"
            invoice.verifactuErrors = [err.message || "Error de comunicación con el servicio web de la AEAT"]
            await invoice.save()
            throw err
          }

          if (result.success) {
            invoice.verifactuStatus = result.estadoRegistro === "AceptadaConErrores" ? "ACCEPTED_WITH_ERRORS" : "ACCEPTED"
            invoice.verifactuCsv = result.csv
            invoice.verifactuSentAt = new Date()
            invoice.verifactuErrors = []
          } else {
            invoice.verifactuStatus = "REJECTED"
            const errorMsg = result.descripcionError || result.message || `Error AEAT código ${result.codigoError || 'desconocido'}`
            invoice.verifactuErrors = [errorMsg]
          }

          await invoice.save()

          const invoiceObj = invoice.toObject()
          invoiceObj.id = invoiceObj._id.toString()
          delete invoiceObj._id

          return {
            invoice: invoiceObj,
            result,
          }
        })
    })
}

export default sendInvoiceVerifactu
