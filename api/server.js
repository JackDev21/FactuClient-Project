import "dotenv/config"
import mongoose from "mongoose"
import express from "express"
import cors from "cors"
import helmet from "helmet"

import errorHandler from "./handlers/errorHandler.js"
import router from "./routes.js"

const { PORT, MONGODB_URL, FRONTEND_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    const api = express()
    api.set("trust proxy", 1)

    // Security headers HTTP (previene XSS, clickjacking, sniffing de MIME, etc.)
    api.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }))

    // CORS configurado para el frontend de la aplicación
    const allowedOrigins = [
      FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000"
    ].filter(Boolean)

    api.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
          return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
      },
      credentials: true
    }))

    api.get("/", (req, res) => {
      res.send("FactuClient API is running")
    })

    api.use("/", router)

    api.use(errorHandler)

    api.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
  })
  .catch((error) => console.error("Error connecting to MongoDB", error))