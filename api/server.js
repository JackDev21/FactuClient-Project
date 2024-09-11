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
    api.use(cors())

    api.get("/", (req, res) => {
      res.send("hellow world")
    })

    api.use("/", router)

    api.use(errorHandler)

    api.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
  })
  .catch((error) => console.error("Error connecting to MongoDB", error))