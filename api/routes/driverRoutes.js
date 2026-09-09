import express from "express"
import { driverHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/drivers", jsonBodyParser, driverHandlers.registerDriverHandler)
router.get("/drivers", driverHandlers.getAllDriversHandler)
router.patch("/drivers/:driverId", jsonBodyParser, driverHandlers.updateDriverHandler)
router.delete("/drivers/:driverId", driverHandlers.deleteDriverHandler)

export default router
