import express from "express"
import { authHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/users", jsonBodyParser, authHandlers.registerUserHandler)
router.post("/users/auth", jsonBodyParser, authHandlers.authenticateUserHandler)
router.post("/request-password-reset", jsonBodyParser, authHandlers.requestPasswordResetHandler)
router.post("/reset-password/:userId/:token", jsonBodyParser, authHandlers.resetPasswordHandler)

export default router
