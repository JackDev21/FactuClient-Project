import express from "express"
import authRoutes from "./authRoutes.js"
import userRoutes from "./userRoutes.js"
import customerRoutes from "./customerRoutes.js"
import deliveryNoteRoutes from "./deliveryNoteRoutes.js"
import invoiceRoutes from "./invoiceRoutes.js"
import decaRoutes from "./decaRoutes.js"
import driverRoutes from "./driverRoutes.js"

const router = express.Router()

router.use("/", authRoutes)
router.use("/", userRoutes)
router.use("/", customerRoutes)
router.use("/", deliveryNoteRoutes)
router.use("/", invoiceRoutes)
router.use("/", decaRoutes)
router.use("/", driverRoutes)

export default router
