import express from "express"
import { decaHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/deca/public/:publicToken/download", decaHandlers.downloadDecaPublicHandler)
router.post("/deca/:deliveryNoteId", jsonBodyParser, decaHandlers.createDecaHandler)
router.get("/deca", decaHandlers.getAllDecasHandler)
router.get("/deca/:decaId", decaHandlers.getDecaHandler)
router.patch("/deca/:decaId", jsonBodyParser, decaHandlers.updateDecaHandler)
router.patch("/deca/:decaId/transport-end", jsonBodyParser, decaHandlers.updateDecaTransportEndHandler)

export default router
