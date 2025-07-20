import express from "express"
import routes from "./handlers/index.js"
import updateInvoiceDateHandler from "./handlers/updateInvoiceDateHandler.js"
import updateInvoicePaymentTypeHandler from "./handlers/updateInvoicePaymentTypeHandler.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json" })

const router = express.Router()

router.post("/users", jsonBodyParser, routes.registerUserHandler)
router.post("/users/auth", jsonBodyParser, routes.authenticateUserHandler)
router.get("/users/:targetUserId", routes.getUserNameHandler)
router.patch("/users/update", jsonBodyParser, routes.updateProfileHandler)

router.get("/users/:targetUserId/profile", routes.getProfileUserHandler)

router.post("/customers", jsonBodyParser, routes.registerCustomHandler)
router.get("/customers", routes.getAllCustomersHandler)
router.delete("/customers/:customerId", routes.deleteCustomerHandler)
router.get("/customers/:customerId/delivery-notes", routes.getAllDeliveryNotesCustomerHandler)
router.patch("/customers/:customerId/update", jsonBodyParser, routes.updateCustomerProfileHandler)


router.get("/delivery-notes", routes.getAllDeliveryNotesHandler)
router.get("/delivery-notes/:deliveryNoteId", routes.getDeliveryNoteHandler)
router.delete("/delivery-notes/:deliveryNoteId", routes.deleteDeliveryNoteHandler)
router.patch("/update-date/:deliveryNoteId", jsonBodyParser, routes.updateDateDeliveryNoteHandler)

router.post("/create/delivery-notes/:customerId", jsonBodyParser, routes.createDeliveryNoteHandler)
router.patch("/create/work/delivery-notes/:deliveryNoteId", jsonBodyParser, routes.createWorkHandler)
router.post("/create/invoices/:customerId", jsonBodyParser, routes.createInvoiceHandler)

router.get("/invoices", routes.getAllInvoicesHandler)
router.get("/invoices/:invoiceId", routes.getInvoiceHandler)
router.delete("/invoices/:invoiceId", routes.deleteInvoiceHandler)
router.patch("/invoices/:invoiceId/date", jsonBodyParser, updateInvoiceDateHandler)
router.patch("/invoices/:invoiceId/payment-type", jsonBodyParser, updateInvoicePaymentTypeHandler)
router.get("/:customerId/invoices", routes.getAllInvoicesCustomerHandler)

router.patch("/observation/delivery-note/:deliveryNoteId", jsonBodyParser, routes.addNewObservation)

router.post("/request-password-reset", jsonBodyParser, routes.requestPasswordResetHandler)

router.post("/reset-password/:userId/:token", jsonBodyParser, routes.resetPasswordHandler)

export default router