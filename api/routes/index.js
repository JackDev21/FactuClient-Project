import express from "express"
import authRoutes from "./authRoutes.js"
import userRoutes from "./userRoutes.js"
import customerRoutes from "./customerRoutes.js"
import deliveryNoteRoutes from "./deliveryNoteRoutes.js"
import invoiceRoutes from "./invoiceRoutes.js"
import decaRoutes from "./decaRoutes.js"

const router = express.Router()

router.use("/", authRoutes)
router.use("/", userRoutes)
router.use("/", customerRoutes)
router.use("/", deliveryNoteRoutes)
router.use("/", invoiceRoutes)
router.use("/", decaRoutes)

export default router
