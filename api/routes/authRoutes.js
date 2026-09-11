import express from "express"
import rateLimit from "express-rate-limit"
import { authHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 20,
  message: {
    error: "CredentialsError",
    message: "Demasiados intentos de acceso fallidos. Por favor, inténtalo de nuevo en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 5,
  message: {
    error: "CredentialsError",
    message: "Has superado el límite de solicitudes de restablecimiento de contraseña. Por favor, espera una hora."
  },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post("/users", jsonBodyParser, authHandlers.registerUserHandler)
router.post("/users/auth", authLimiter, jsonBodyParser, authHandlers.authenticateUserHandler)
router.post("/request-password-reset", resetPasswordLimiter, jsonBodyParser, authHandlers.requestPasswordResetHandler)
router.post("/reset-password/:userId/:token", jsonBodyParser, authHandlers.resetPasswordHandler)

export default router
