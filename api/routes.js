import express from "express"
import routes from "./handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json" })

const router = express.Router()

router.post("/users", jsonBodyParser, routes.registerUserHandler)
router.post("/users/auth", jsonBodyParser, routes.authenticateUserHandler)
router.get("/users/:targetUserId", routes.getUserNameHandler)
router.patch("/users/:userId/update", jsonBodyParser, routes.updateProfileHandler)

router.get("/users/:targetUserId/profile", routes.getProfileUserHandler)

router.post("/customers", jsonBodyParser, routes.registerCustomHandler)
router.get("/customers", routes.getAllCustomersHandler)
router.delete("/customers/:customerId", routes.deleteCustomerHandler)
router.get("/customers/:customerId/delivery-notes", routes.getAllDeliveryNotesCustomerHandler)
router.patch("/customers/:customerId/update", jsonBodyParser, routes.updateCustomerProfileHandler)


router.get("/delivery-notes", routes.getAllDeliveryNotesHandler)
router.get("/delivery-notes/:deliveryNoteId", routes.getDeliveryNoteHandler)
router.delete("/delivery-notes/:deliveryNoteId", routes.deleteDeliveryNoteHandler)

router.post("/create/delivery-notes/:customerId", jsonBodyParser, routes.createDeliveryNoteHandler)
router.patch("/create/work/delivery-notes/:deliveryNoteId", jsonBodyParser, routes.createWorkHandler)
router.post("/create/invoices/:customerId", jsonBodyParser, routes.createInvoiceHandler)

router.get("/invoices", routes.getAllInvoicesHandler)
router.get("/invoices/:invoiceId", routes.getInvoiceHandler)
router.delete("/invoices/:invoiceId", routes.deleteInvoiceHandler)
router.get("/:customerId/invoices", routes.getAllInvoicesCustomerHandler)

router.patch("/observation/delivery-note/:deliveryNoteId", jsonBodyParser, routes.addNewObservation)


export default router