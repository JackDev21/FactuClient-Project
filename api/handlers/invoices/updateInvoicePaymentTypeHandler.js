import "dotenv/config"
import jwt from "../../utils/jsonwebtoken-promised.js"
import logic from "../../logic/index.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default function updateInvoicePaymentTypeHandler(req, res, next) {
  try {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      return next(new CredentialsError("Token missing"))
    }
    const token = req.headers.authorization.slice(7)
    const { invoiceId } = req.params
    const { paymentType } = req.body

    jwt.verify(token, JWT_SECRET)
      .then(payload => {
        const { sub: userId } = payload
        return logic.updateInvoicePaymentType(userId, invoiceId, paymentType)
          .then(updatedInvoice => res.json(updatedInvoice))
          .catch(error => next(error))
      })
      .catch(error => next(new CredentialsError(error.message)))
  } catch (error) {
    next(error)
  }
}
