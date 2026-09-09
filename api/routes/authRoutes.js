import express from "express"
import routes from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.post("/users", jsonBodyParser, routes.registerUserHandler)
router.post("/users/auth", jsonBodyParser, routes.authenticateUserHandler)
router.post("/request-password-reset", jsonBodyParser, routes.requestPasswordResetHandler)
router.post("/reset-password/:userId/:token", jsonBodyParser, routes.resetPasswordHandler)

export default router
