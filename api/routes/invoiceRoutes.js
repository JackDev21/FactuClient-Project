import express from "express"
import routes from "../handlers/index.js"
import updateInvoiceDateHandler from "../handlers/updateInvoiceDateHandler.js"
import updateInvoicePaymentTypeHandler from "../handlers/updateInvoicePaymentTypeHandler.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/create/invoices/:customerId", jsonBodyParser, routes.createInvoiceHandler)
router.get("/invoices", routes.getAllInvoicesHandler)
router.get("/invoices/:invoiceId", routes.getInvoiceHandler)
router.delete("/invoices/:invoiceId", routes.deleteInvoiceHandler)
router.patch("/invoices/:invoiceId/date", jsonBodyParser, updateInvoiceDateHandler)
router.patch("/invoices/:invoiceId/payment-type", jsonBodyParser, updateInvoicePaymentTypeHandler)
router.get("/:customerId/invoices", routes.getAllInvoicesCustomerHandler)

export default router
