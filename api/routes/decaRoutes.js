import express from "express"
import routes from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/deca/public/:publicToken/download", routes.downloadDecaPublicHandler)
router.post("/deca/:deliveryNoteId", jsonBodyParser, routes.createDecaHandler)
router.get("/deca", routes.getAllDecasHandler)
router.get("/deca/:decaId", routes.getDecaHandler)
router.patch("/deca/:decaId", jsonBodyParser, routes.updateDecaHandler)
router.patch("/deca/:decaId/transport-end", jsonBodyParser, routes.updateDecaTransportEndHandler)

export default router
