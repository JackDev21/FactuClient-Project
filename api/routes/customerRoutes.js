import express from "express"
import { customerHandlers, deliveryNoteHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/customers", jsonBodyParser, customerHandlers.registerCustomerHandler)
router.get("/customers", customerHandlers.getAllCustomersHandler)
router.delete("/customers/:customerId", customerHandlers.deleteCustomerHandler)
router.get("/customers/:customerId/delivery-notes", deliveryNoteHandlers.getAllDeliveryNotesCustomerHandler)
router.patch("/customers/:customerId/update", jsonBodyParser, customerHandlers.updateCustomerProfileHandler)

export default router
