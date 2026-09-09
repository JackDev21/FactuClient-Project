import express from "express"
import { deliveryNoteHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/delivery-notes", deliveryNoteHandlers.getAllDeliveryNotesHandler)
router.get("/delivery-notes/:deliveryNoteId", deliveryNoteHandlers.getDeliveryNoteHandler)
router.delete("/delivery-notes/:deliveryNoteId", deliveryNoteHandlers.deleteDeliveryNoteHandler)
router.patch("/update-date/:deliveryNoteId", jsonBodyParser, deliveryNoteHandlers.updateDeliveryNoteDateHandler)

router.post("/create/delivery-notes/:customerId", jsonBodyParser, deliveryNoteHandlers.createDeliveryNoteHandler)
router.patch("/create/work/delivery-notes/:deliveryNoteId", jsonBodyParser, deliveryNoteHandlers.createWorkHandler)
router.patch("/delivery-notes/:deliveryNoteId/works/:workId", jsonBodyParser, deliveryNoteHandlers.updateWorkHandler)
router.delete("/delivery-notes/:deliveryNoteId/works/:workId", deliveryNoteHandlers.deleteWorkHandler)

router.patch("/observation/delivery-note/:deliveryNoteId", jsonBodyParser, deliveryNoteHandlers.addNewObservationHandler)

export default router
