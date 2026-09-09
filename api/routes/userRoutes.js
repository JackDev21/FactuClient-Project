import express from "express"
import routes from "../handlers/index.js"

const jsonBodyParser = express.json({ strict: true, type: "application/json", limit: "10mb" })
const router = express.Router()

router.get("/users/:targetUserId", routes.getUserNameHandler)
router.patch("/users/update", jsonBodyParser, routes.updateProfileHandler)
router.get("/users/:targetUserId/profile", routes.getProfileUserHandler)

export default router
