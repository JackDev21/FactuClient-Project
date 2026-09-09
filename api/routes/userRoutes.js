import express from "express"
import { userHandlers } from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/users/:targetUserId", userHandlers.getUserNameHandler)
router.patch("/users/update", jsonBodyParser, userHandlers.updateProfileHandler)
router.get("/users/:targetUserId/profile", userHandlers.getProfileUserHandler)

export default router
