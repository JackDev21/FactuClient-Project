import "dotenv/config"
import mongoose from "mongoose"
import express from "express"
import cors from "cors"

import errorHandler from "./handlers/errorHandler.js"
import router from "./routes.js"

const { PORT, MONGODB_URL } = process.env

mongoose.connect(MONGODB_URL)
  .then(() => {
    const api = express()

    // Configurar CORS con opciones específicas
    const allowedOrigins = ['http://localhost:5173', 'https://factuclient.netlify.app']

    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type']
    }

    api.use(cors(corsOptions))

    api.get("/", (req, res) => {
      res.send("hellow world")
    })

    api.use("/", router)

    api.use(errorHandler)

    api.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
  })
  .catch((error) => console.error("Error connecting to MongoDB", error))