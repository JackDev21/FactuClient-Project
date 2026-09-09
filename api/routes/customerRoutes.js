import express from "express"
import routes from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/customers", jsonBodyParser, routes.registerCustomHandler)
router.get("/customers", routes.getAllCustomersHandler)
router.delete("/customers/:customerId", routes.deleteCustomerHandler)
router.get("/customers/:customerId/delivery-notes", routes.getAllDeliveryNotesCustomerHandler)
router.patch("/customers/:customerId/update", jsonBodyParser, routes.updateCustomerProfileHandler)

export default router
