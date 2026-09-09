import express from "express"
import routes from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/delivery-notes", routes.getAllDeliveryNotesHandler)
router.get("/delivery-notes/:deliveryNoteId", routes.getDeliveryNoteHandler)
router.delete("/delivery-notes/:deliveryNoteId", routes.deleteDeliveryNoteHandler)
router.patch("/update-date/:deliveryNoteId", jsonBodyParser, routes.updateDateDeliveryNoteHandler)

router.post("/create/delivery-notes/:customerId", jsonBodyParser, routes.createDeliveryNoteHandler)
router.patch("/create/work/delivery-notes/:deliveryNoteId", jsonBodyParser, routes.createWorkHandler)
router.patch("/delivery-notes/:deliveryNoteId/works/:workId", jsonBodyParser, routes.updateWorkHandler)
router.delete("/delivery-notes/:deliveryNoteId/works/:workId", routes.deleteWorkHandler)

router.patch("/observation/delivery-note/:deliveryNoteId", jsonBodyParser, routes.addNewObservation)

export default router
