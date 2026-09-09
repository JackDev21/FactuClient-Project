import express from "express"
import { invoiceHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/create/invoices/:customerId", jsonBodyParser, invoiceHandlers.createInvoiceHandler)
router.get("/invoices", invoiceHandlers.getAllInvoicesHandler)
router.get("/invoices/:invoiceId", invoiceHandlers.getInvoiceHandler)
router.delete("/invoices/:invoiceId", invoiceHandlers.deleteInvoiceHandler)
router.patch("/invoices/:invoiceId/date", jsonBodyParser, invoiceHandlers.updateInvoiceDateHandler)
router.patch("/invoices/:invoiceId/payment-type", jsonBodyParser, invoiceHandlers.updateInvoicePaymentTypeHandler)
router.get("/:customerId/invoices", invoiceHandlers.getAllInvoicesCustomerHandler)

export default router
